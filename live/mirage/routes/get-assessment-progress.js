import _ from 'pix-live/utils/lodash-custom';
import refAssessmentProgress from '../data/assessment-progresses/ref-assessment-progress';
import refAssessmentProgressTimedChallenges from '../data/assessment-progresses/ref-assessment-progress-timed-challenges';

export default function(schema, request) {
  const assessmentId = request.params.id;

  const allAssessmentProgresses = [
    refAssessmentProgress,
    refAssessmentProgressTimedChallenges
  ];

  const assessmentProgress = _.filter(allAssessmentProgresses, ['assessment.id', assessmentId]);

  if (assessmentProgress) {
    return assessmentProgress[0];
  }
  //return schema.assessment.find(assessmentId);
}
