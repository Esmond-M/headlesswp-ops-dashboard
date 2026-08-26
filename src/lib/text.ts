export function plainText(value: string | undefined | null): string {
  if (!value) {
    return '';
  }

  const element = document.createElement('textarea');
  element.innerHTML = value.replace(/<[^>]+>/g, '');
  return element.value.trim();
}
