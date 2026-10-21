import type { CloudCategory } from '../ui/PhotoCloud'

// Debug > Real-life: what a reflection she just wrote is mostly about, so the
// photo's circle glows that filter's color (Feeling pink, People yellow,
// Places blue). TypeSafe reads it first (app/judgeReflection, api/classify.ts);
// this word count is the fallback when that isn't available: whichever kind
// of word shows up most wins, and a photo with nothing else said is a place.
const words: Record<CloudCategory, string[]> = {
  feeling: [
    'feel', 'feels', 'felt', 'feeling', 'happy', 'sad', 'miss', 'missed', 'love', 'loved', 'tired', 'excited',
    'nervous', 'grateful', 'calm', 'proud', 'scared', 'lonely', 'anxious', 'peaceful', 'weird', 'nostalgic',
    'stressed', 'relieved', 'hopeful', 'bittersweet', 'glad', 'cozy', 'overwhelmed', 'heart', 'cry', 'cried',
    'smile', 'smiled', 'laugh', 'laughed', 'remember', 'memory', 'memories', 'beautiful', 'lucky', 'alone',
  ],
  people: [
    'friend', 'friends', 'with', 'we', 'us', 'our', 'they', 'them', 'he', 'she', 'him', 'her', 'mom', 'dad',
    'family', 'sister', 'brother', 'roommate', 'roommates', 'classmate', 'classmates', 'team', 'professor',
    'teacher', 'everyone', 'people', 'someone', 'together', 'met', 'meet', 'talked', 'hug', 'partner',
  ],
  places: [
    'building', 'school', 'campus', 'cafe', 'café', 'street', 'park', 'place', 'here', 'there', 'view', 'city',
    'beach', 'home', 'room', 'library', 'studio', 'hall', 'class', 'classroom', 'stairs', 'window', 'corner',
    'spot', 'walk', 'walked', 'light', 'sky', 'outside', 'inside', 'floor', 'roof', 'garden', 'downtown',
  ],
}

export function reflectionCategory(text: string): CloudCategory {
  const said = text.toLowerCase().match(/[\p{L}']+/gu) ?? []
  const score = (category: CloudCategory) => said.filter((word) => words[category].includes(word)).length
  const ranked = (['feeling', 'people', 'places'] as CloudCategory[]).map((category) => ({ category, score: score(category) }))
  const best = ranked.reduce((top, next) => (next.score > top.score ? next : top))
  return best.score > 0 ? best.category : 'places'
}

// How the label under the photo names each one
export const reflectionCategoryLabel: Record<CloudCategory, string> = {
  feeling: 'A feeling',
  people: 'About people',
  places: 'A place',
}
