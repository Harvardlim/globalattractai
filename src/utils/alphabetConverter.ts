export function convertAlphabetsToNumbers(input: string): string {
  return input
    .toUpperCase()
    .split('')
    .map(char => {
      const charCode = char.charCodeAt(0);
      // Check if it's A-Z (65-90 in ASCII)
      if (charCode >= 65 && charCode <= 90) {
        return (charCode - 64).toString(); // A=65, so A-64=1
      }
      return char; // Keep numbers and other characters as is
    })
    .join('');
}