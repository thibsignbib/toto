import ClientInvitation from "./ClientInvitation"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Page(props: any) {
  const slug = props.params.slug as string
  return <ClientInvitation slug={slug} />
}
