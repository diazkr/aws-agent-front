export async function InvokeLLM({ prompt, add_context_from_internet }: { prompt: string; add_context_from_internet: boolean }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Respuesta generada para el prompt: "${prompt}"`);
    }, 1000); 
  });
}