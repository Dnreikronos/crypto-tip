import { AlertCircle } from 'lucide-react'

export function TipsInfoPanel() {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-lg animate-fade-in">
      <h3 className="flex items-center text-xl font-bold mb-4 text-white">
        <AlertCircle className="h-5 w-5 mr-2 text-cyan-400" /> Tips for Success
      </h3>
      <ul className="space-y-3 text-gray-400">
        <li className="flex items-start">
          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-cyan-900 text-cyan-400 text-xs mr-2 mt-0.5">1</span>
          <span>Be specific about your project goals and how funds will be used</span>
        </li>
        <li className="flex items-start">
          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-cyan-900 text-cyan-400 text-xs mr-2 mt-0.5">2</span>
          <span>Include a compelling project description with relevant details</span>
        </li>
        <li className="flex items-start">
          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-cyan-900 text-cyan-400 text-xs mr-2 mt-0.5">3</span>
          <span>Set a reasonable funding goal to attract supporters</span>
        </li>
        <li className="flex items-start">
          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-cyan-900 text-cyan-400 text-xs mr-2 mt-0.5">4</span>
          <span>Share your project funding page on social media for visibility</span>
        </li>
      </ul>
    </div>
  )
}