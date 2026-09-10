import {
  collectObjectKeys,
  deleteTigrisObjects,
  extractObjectKey,
} from "@/lib/tigris"

type MaterialLike = {
  url?: string
  key?: string
}

type QuestionLike = {
  promptImageUrl?: string | null
  promptImageKey?: string | null
  optionImageUrls?: string[] | null
}

export function materialStorageKeys(materials: unknown): string[] {
  if (!Array.isArray(materials)) return []
  const values: Array<string | null | undefined> = []
  for (const item of materials) {
    if (!item || typeof item !== "object") continue
    const row = item as MaterialLike
    values.push(row.key, row.url)
  }
  return collectObjectKeys(values)
}

export function questionStorageKeys(questions: QuestionLike[]): string[] {
  const values: Array<string | null | undefined> = []
  for (const question of questions) {
    values.push(question.promptImageKey, question.promptImageUrl)
    for (const url of question.optionImageUrls || []) {
      values.push(url)
    }
  }
  return collectObjectKeys(values)
}

export function moduleStorageKeys(moduleRow: {
  videoPublicId?: string | null
  videoUrl?: string | null
  materials?: unknown
  questions?: QuestionLike[]
}) {
  return collectObjectKeys([
    moduleRow.videoPublicId,
    moduleRow.videoUrl,
    ...materialStorageKeys(moduleRow.materials),
    ...questionStorageKeys(moduleRow.questions || []),
  ])
}

export async function removeStorageKeys(keys: string[]) {
  const result = await deleteTigrisObjects(keys)
  // Storage cleanup should not block DB updates if Tigris is briefly down,
  // but we still log via deleteTigrisObjects.
  return result
}

export function keysRemovedFromMaterials(
  previous: unknown,
  next: unknown,
): string[] {
  const before = new Set(materialStorageKeys(previous))
  const after = new Set(materialStorageKeys(next))
  return [...before].filter((key) => !after.has(key))
}

export { extractObjectKey, collectObjectKeys }
