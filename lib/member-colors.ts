import type { Member } from "./types"

const COLOR_MAP: Record<string, { bg: string; text: string; dot: string }> = {
  Red: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
  Blue: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  Green: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
  Orange: { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
  Purple: { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" },
  Yellow: { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" },
  Pink: { bg: "bg-pink-100", text: "text-pink-700", dot: "bg-pink-500" },
  Teal: { bg: "bg-teal-100", text: "text-teal-700", dot: "bg-teal-500" },
}

const DEFAULT_COLOR = { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500" }

export function getMemberColor(colorName: string) {
  return COLOR_MAP[colorName] || DEFAULT_COLOR
}

export function findMember(members: Member[], name: string) {
  return members.find((m) => m.name === name)
}
