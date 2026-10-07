export async function onRequest(context) {
  const response = await context.next();
  return response;
}