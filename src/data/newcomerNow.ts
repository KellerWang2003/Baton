// "You're a Newcomer now" (after LA Wrapped, Keller Oct 19): the hand-off from
// looking back at LA to starting in New York. Her LA folder slides aside and a
// new, empty New York folder comes in on top, and on to Today.
export const newcomerNow = {
  tag: 'Newcomer',
  // The heading, with the Newcomer pill (tag) set inline after `lead`
  title: { lead: 'You’re a', rest: 'in New York now' },
  // Two lines: the second starts at "Here’s"
  subtitle: 'Your LA chapter is saved.\nHere’s to the next one.',
  // Keller, Oct 21: the main button opens Archive, where the new New York
  // folder files itself in; the quiet one under it goes straight to Today
  cta: 'Check out your new Archive',
  secondary: 'Go to Today',
  // Same colors as their Archive folders (FolderStack's folderTones)
  la: { city: 'LA', dates: '09.2023-01.2027', tone: 'blue' as const },
  ny: { city: 'New York', dates: '01.2027-', tone: 'yellow' as const },
}
