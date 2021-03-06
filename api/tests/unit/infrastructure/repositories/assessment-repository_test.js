const { describe, it, expect, before, after, knex, sinon, beforeEach, afterEach } = require('../../../test-helper');

const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const Assessment = require('../../../../lib/domain/models/data/assessment');

describe('Unit | Repository | assessmentRepository', () => {

  describe('#findLastAssessmentsForEachCoursesByUser', () => {
    const JOHN = 2;
    const LAYLA = 3;
    const assessmentsInDb = [{
      id: 1,
      userId: JOHN,
      courseId: 'courseId1',
      estimatedLevel: 1,
      pixScore: 10,
      type: null
    }, {
      id: 2,
      userId: LAYLA,
      courseId: 'courseId1',
      estimatedLevel: 2,
      pixScore: 20,
      type: null
    }, {
      id: 3,
      userId: JOHN,
      courseId: 'courseId1',
      estimatedLevel: 3,
      pixScore: 30,
      type: null
    }, {
      id: 4,
      userId: JOHN,
      courseId: 'courseId2',
      estimatedLevel: 3,
      pixScore: 37,
      type: null
    }, {
      id: 5,
      userId: JOHN,
      courseId: 'courseId3',
      estimatedLevel: 3,
      pixScore: 37,
      type : 'CERTIFICATION'
    }, {
      id: 6,
      userId: LAYLA,
      courseId: 'nullAssessmentPreview',
      estimatedLevel: 1,
      pixScore: 1,
      type: null
    }];

    before(() => {
      return knex('assessments').insert(assessmentsInDb);
    });

    after(() => {
      return knex('assessments').delete();
    });

    it('should return the list of assessments (which are not Certifications) for each courses from JOHN', () => {
      // When
      const promise = assessmentRepository.findLastAssessmentsForEachCoursesByUser(JOHN);

      // Then
      return promise.then((assessments) => {
        expect(assessments).to.have.lengthOf(2);

        const firstId = assessments[0].id;
        expect(firstId).to.equal(1);

        const secondId = assessments[1].id;
        expect(secondId).to.equal(4);
      });
    });

    it('should not return preview assessments', () => {
      // When
      const promise = assessmentRepository.findLastAssessmentsForEachCoursesByUser(LAYLA);

      // Then
      return promise.then((assessments) => {
        expect(assessments).to.have.lengthOf(1);
      });
    });

    it('should throw an error if something went wrong', () => {
      //Given
      const error = new Error('Unable to fetch');
      const whereStub = sinon.stub(Assessment, 'where').returns({
        fetchAll: () => {
          return Promise.reject(error);
        }
      });

      // When
      const promise = assessmentRepository.findLastAssessmentsForEachCoursesByUser(JOHN);

      // Then
      whereStub.restore();
      return promise
        .catch((err) => {
          expect(err).to.equal(error);
        });
    });
  });

  describe('#findLastCompletedAssessmentsByUser', () => {
    const assessmentsInDb = [{
      id: 1,
      userId: 2,
      courseId: 'courseId1',
      estimatedLevel: 1,
      pixScore: 10
    }, {
      id: 2,
      userId: 3,
      courseId: 'courseId1',
      estimatedLevel: 2,
      pixScore: 20
    }];

    before(() => {
      return knex('assessments').insert(assessmentsInDb);
    });

    after(() => {
      return knex('assessments').delete();
    });

    let sandbox;
    let queryStub;
    let fetchStub;
    let whereStub;
    let whereNotNullStub;
    let whereNotNullStub2;
    let orderByStub;
    let andWhere;
    const userId = 2;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      orderByStub = sandbox.stub();
      andWhere = sandbox.stub().returns({
        orderBy: orderByStub
      });
      whereNotNullStub2 = sandbox.stub().returns({
        andWhere: andWhere
      });
      whereNotNullStub = sandbox.stub().returns({
        whereNotNull: whereNotNullStub2
      });

      whereStub = sandbox.stub().returns({
        whereNotNull: whereNotNullStub
      });

      fetchStub = sandbox.stub().resolves({ models: {} });
      queryStub = sandbox.stub().yields({ where: whereStub }).returns({
        fetch: fetchStub
      });
      sandbox.stub(Assessment, 'collection').returns({
        query: queryStub
      });
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should correctly query Assessment conditions', () => {
      // when
      const promise = assessmentRepository.findLastCompletedAssessmentsForEachCoursesByUser(userId);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(Assessment.collection);
        sinon.assert.calledOnce(queryStub);
        sinon.assert.calledOnce(whereStub);
        sinon.assert.calledOnce(fetchStub);

        sinon.assert.calledOnce(whereNotNullStub);
        sinon.assert.calledWith(whereNotNullStub, 'estimatedLevel');

        sinon.assert.calledOnce(whereNotNullStub2);
        sinon.assert.calledWith(whereNotNullStub2, 'pixScore');

        sinon.assert.calledOnce(orderByStub);
        sinon.assert.calledWith(orderByStub, 'createdAt', 'desc');
      });
    });
  });

  describe('#findCompletedAssessmentsByUserId', () => {

    const JOHN = 2;
    const LAYLA = 3;
    const COMPLETED_ASSESSMENT_A_ID = 1;
    const COMPLETED_ASSESSMENT_B_ID = 2;
    const UNCOMPLETE_ASSESSMENT_ID = 3;

    const assessmentsInDb = [{
      id: COMPLETED_ASSESSMENT_A_ID,
      userId: JOHN,
      courseId: 'courseId',
      estimatedLevel: 1,
      pixScore: 10
    }, {
      id: COMPLETED_ASSESSMENT_B_ID,
      userId: JOHN,
      courseId: 'courseId',
      estimatedLevel: 3,
      pixScore: 30
    }, {
      id: UNCOMPLETE_ASSESSMENT_ID,
      userId: JOHN,
      courseId: 'courseId',
      estimatedLevel: null,
      pixScore: null
    }, {
      id: 4,
      userId: LAYLA,
      courseId: 'courseId',
      estimatedLevel: 2,
      pixScore: 20
    }, {
      id: 5,
      userId: JOHN,
      courseId: 'courseId',
      estimatedLevel: 3,
      pixScore: 30,
      type: 'CERTIFICATION'
    }, {
      id: 6,
      userId: LAYLA,
      courseId: 'nullAssessmentPreview',
      estimatedLevel: 1,
      pixScore: 1
    }];

    before(() => {
      return knex('assessments').insert(assessmentsInDb);
    });

    after(() => {
      return knex('assessments').delete();
    });

    it('should return the list of assessments (which are not Certifications) from JOHN', () => {
      // When
      const promise = assessmentRepository.findCompletedAssessmentsByUserId(JOHN);

      // Then
      return promise.then((assessments) => {
        expect(assessments).to.have.lengthOf(2);
        expect(assessments[0].id).to.equal(COMPLETED_ASSESSMENT_A_ID);
        expect(assessments[1].id).to.equal(COMPLETED_ASSESSMENT_B_ID);

      });
    });

    it('should not return preview assessments from LAYLA', () => {
      // When
      const promise = assessmentRepository.findCompletedAssessmentsByUserId(LAYLA);

      // Then
      return promise.then((assessments) => {
        expect(assessments).to.have.lengthOf(1);
      });
    });

    it('should throw an error if something went wrong', () => {
      //Given
      const error = new Error('Unable to fetch');
      const whereStub = sinon.stub(Assessment, 'where').returns({
        fetchAll: () => {
          return Promise.reject(error);
        }
      });

      // When
      const promise = assessmentRepository.findLastAssessmentsForEachCoursesByUser(JOHN);

      // Then
      whereStub.restore();
      return promise
        .catch((err) => {
          expect(err).to.equal(error);
        });

    });

  });

  describe('#getByUserIdAndAssessmentId', () => {

    it('should be a function', () => {
      expect(assessmentRepository.getByUserIdAndAssessmentId).to.be.a('function');
    });

    describe('test collaboration', () => {
      let fetchStub;
      beforeEach(() => {
        fetchStub = sinon.stub().resolves();
        sinon.stub(Assessment, 'query').returns({
          fetch: fetchStub
        });
      });

      after(() => {
        Assessment.query.restore();
      });

      it('should correctly query Assessment', () => {
        // given
        const fakeUserId = 3;
        const fakeAssessmentId = 2;
        const expectedParams = {
          where: { id: fakeAssessmentId },
          andWhere: { userId: fakeUserId }
        };

        // when
        const promise = assessmentRepository.getByUserIdAndAssessmentId(fakeAssessmentId, fakeUserId);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(Assessment.query);
          sinon.assert.calledWith(Assessment.query, expectedParams);
          sinon.assert.calledWith(fetchStub, { require: true });
        });
      });
    });

  });

  describe('#save', function() {

    const assessment = { id: '1', type: 'CERTIFICATION' };
    const assessmentBookshelf = new Assessment(assessment);

    beforeEach(() => {
      sinon.stub(Assessment.prototype, 'save').resolves(assessmentBookshelf);
    });

    afterEach(() => {
      Assessment.prototype.save.restore();
    });

    it('should save a new assessment', function() {
      // when
      const promise = assessmentRepository.save(assessment);

      // then
      promise.then(() => {
        sinon.assert.calledOnce(Assessment.prototype.save);
      });
    });

    it('should return a JSON with the assessment', function() {
      // when
      const promise = assessmentRepository.save(assessment);

      // then
      promise.then((savedAssessment) => {
        expect(savedAssessment).to.deep.equal(assessment);
      });
    });
  });

  describe('#getByCertificationCourseId', () => {
    let fetchStub;
    beforeEach(() => {
      fetchStub = sinon.stub().resolves();
      sinon.stub(Assessment, 'where').returns({
        fetch: fetchStub
      });
    });

    after(() => {
      Assessment.where.restore();
    });

    it('should correctly query Assessment', () => {
      // given
      const fakeCertificationCourseId = 10;
      const expectedParams = { courseId: fakeCertificationCourseId };

      // when
      const promise = assessmentRepository.getByCertificationCourseId(fakeCertificationCourseId);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(Assessment.where);
        sinon.assert.calledWith(Assessment.where, expectedParams);
      });
    });
  });
});

