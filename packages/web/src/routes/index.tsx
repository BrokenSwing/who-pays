import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "../components/Logo";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const [name, setName] = useState("");

  function createGroup() {
    const token = crypto.randomUUID();
    navigate({ to: "/g/$groupToken", params: { groupToken: token } });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Logo className="w-16 h-16 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Who Pays?</h1>
          <p className="text-gray-500 mt-1 text-center">Track shared expenses, settle up fairly.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createGroup()}
              placeholder="Weekend trip, Roommates..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={createGroup}
            className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-medium hover:bg-blue-700 transition-colors"
          >
            Create group
          </button>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Have a link? Paste it in your browser.
        </p>
      </div>
    </div>
  );
}
