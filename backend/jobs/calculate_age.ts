export function calculateAge(date_of_birth: string | Date): number {
  const dob = new Date(date_of_birth);
  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());

  if (!hasHadBirthdayThisYear) age--;

  return age;
}
