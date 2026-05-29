import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Logo } from "../components/Logo"
import { Field } from "../components/Field"

export const Route = createFileRoute("/")({
  component: Landing,
})

function Landing() {
  const navigate = useNavigate()
  const [name, setName] = useState("")

  function createGroup() {
    const token = crypto.randomUUID()
    navigate({ to: "/g/$groupToken", params: { groupToken: token } })
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-card rounded-xl shadow-md ring-1 ring-border p-8 w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <Logo className="w-14 h-14" />
          <div className="text-center">
            <h1 className="text-xl font-semibold text-foreground">Who Pays?</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Track shared expenses, settle up fairly.</p>
          </div>
        </div>

        <div className="space-y-4">
          <Field label="Group name">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createGroup()}
              placeholder="Weekend trip, Roommates…"
              className="input"
            />
          </Field>
          <button onClick={createGroup} className="btn-primary w-full">
            Create group
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Have a link? Paste it in your browser.
        </p>
      </div>
    </div>
  )
}
