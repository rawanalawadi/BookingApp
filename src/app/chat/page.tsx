import BookingChat from "@/components/chat/BookingChat"

export const metadata = {
  title: "AI Booking Assistant — ConsultEase",
  description: "Book a consultation session with our AI-powered assistant using RAG technology.",
}

export default function ChatPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-teal-50/60 to-white flex flex-col">
      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 flex flex-col">
        {/* Page heading */}
        <div className="mb-4 text-center">
          <span className="inline-block bg-teal-100 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
            RAG-Powered
          </span>
        </div>

        {/* Chat container */}
        <div className="flex-1 bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden flex flex-col" style={{ minHeight: "70vh" }}>
          <BookingChat />
        </div>

        <p className="text-center text-xs text-gray-400 mt-3">
          The assistant uses semantic search to match you with the right consultant.
        </p>
      </div>
    </div>
  )
}
