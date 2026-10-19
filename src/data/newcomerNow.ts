// "You're a Newcomer now" (after LA Wrapped, Keller Oct 19): the hand-off from
// looking back at LA to starting in New York. Her LA folder slides aside and a
// new, empty New York folder comes in on top, and on to Today.
export const newcomerNow = {
  tag: 'Newcomer',
  title: ['You’re a Newcomer', 'in New York now'],
  subtitle: 'Your LA chapter is saved. Here’s to the next one.',
  cta: 'Start in New York',
  // Same colors as their Archive folders (FolderStack's folderTones)
  la: { city: 'LA', dates: '09.2023-01.2027', tone: 'blue' as const },
  ny: { city: 'New York', dates: '01.2027-', tone: 'yellow' as const },
}
