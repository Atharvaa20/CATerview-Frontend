import InterviewForm from '../components/interview/InterviewForm'

export default function SubmitExperiencePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Share Your Interview Experience
      </h1>
      <p className="text-gray-600 mb-8">
        Help future aspirants by sharing your interview experience. Your submission will be reviewed by our team before being published.
      </p>
      <InterviewForm />
    </div>
  )
}
