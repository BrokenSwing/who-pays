import { createContext, useContext } from "react"

type CurrentMemberContextValue = {
  currentMemberId: string | null
  setCurrentMemberId: (id: string) => void
}

export const CurrentMemberContext = createContext<CurrentMemberContextValue>({
  currentMemberId: null,
  setCurrentMemberId: () => {},
})

export function useCurrentMember() {
  return useContext(CurrentMemberContext)
}
