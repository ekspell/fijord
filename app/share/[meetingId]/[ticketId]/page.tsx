import { notFound } from "next/navigation";
import { getShareBundle, isKVConfigured } from "@/lib/kv";
import { Metadata } from "next";

type Props = {
  params: Promise<{ meetingId: string; ticketId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { meetingId, ticketId } = await params;
  if (!isKVConfigured()) return { title: "Fjord" };

  const bundle = await getShareBundle(meetingId);
  const ticket = bundle?.tickets.find((t) => t.id === ticketId);

  return {
    title: ticket ? `${ticket.id}: ${ticket.title} | Fjord` : "Fjord",
    description: ticket?.description?.slice(0, 160) || "Ticket created with Fjord",
  };
}

export default async function ShareTicketPage({ params }: Props) {
  const { meetingId, ticketId } = await params;

  if (!isKVConfigured()) notFound();

  const bundle = await getShareBundle(meetingId);
  if (!bundle) notFound();

  const ticket = bundle.tickets.find((t) => t.id === ticketId);
  if (!ticket) notFound();

  const expiresAt = new Date(
    new Date(bundle.createdAt).getTime() + 90 * 24 * 60 * 60 * 1000
  ).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/85 px-8 backdrop-blur-md" style={{ height: 56 }}>
        <div className="mx-auto flex h-full max-w-[800px] items-center">
          <a href="https://fijord.app" target="_blank" rel="noopener noreferrer">
            <svg width="109" height="54" viewBox="0 0 109 54" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-14 w-auto text-foreground">
              <path d="M34.6914 20.9738L31.3892 17.6658L18.9455 17.6543L16 20.6286V20.7091H29.4965L16.2244 33.9927L18.376 36.1328L25.2048 29.2868V34.6313H25.268L28.156 31.7376L28.2078 26.301L31.6538 22.8607V36.3457H31.7401L34.6914 33.3944V20.9738Z" fill="currentColor" />
              <path d="M49.8852 33V21.0617H57.5087V22.716H51.9318V26.2122H56.4854V27.8324H51.9318V33H49.8852ZM58.7678 33V24.4556H60.8143V33H58.7678ZM59.7911 23.0571C59.4159 23.0571 59.1032 22.9434 58.8531 22.716C58.6143 22.4886 58.4949 22.2044 58.4949 21.8633C58.4949 21.5108 58.6143 21.2266 58.8531 21.0106C59.1032 20.7832 59.4159 20.6695 59.7911 20.6695C60.1663 20.6695 60.4733 20.7832 60.712 21.0106C60.9622 21.2266 61.0872 21.5108 61.0872 21.8633C61.0872 22.2044 60.9622 22.4886 60.712 22.716C60.4733 22.9434 60.1663 23.0571 59.7911 23.0571ZM61.0138 36.752V35.0125H61.696C62.0826 35.0125 62.3554 34.9329 62.5146 34.7737C62.6852 34.6259 62.7704 34.3644 62.7704 33.9892V24.4556H64.817V34.0062C64.817 34.6657 64.7033 35.1944 64.4759 35.5923C64.2485 36.0016 63.9245 36.2972 63.5038 36.4792C63.0945 36.6611 62.5999 36.752 62.02 36.752H61.0138ZM63.7937 23.0571C63.4185 23.0571 63.1115 22.9434 62.8728 22.716C62.634 22.4886 62.5146 22.2044 62.5146 21.8633C62.5146 21.5108 62.634 21.2266 62.8728 21.0106C63.1115 20.7832 63.4242 20.6695 63.8108 20.6695C64.186 20.6695 64.493 20.7832 64.7317 21.0106C64.9705 21.2266 65.0899 21.5108 65.0899 21.8633C65.0899 22.2044 64.9705 22.4886 64.7317 22.716C64.493 22.9434 64.1803 23.0571 63.7937 23.0571ZM70.627 33.2047C69.8198 33.2047 69.0864 33.0171 68.427 32.6419C67.7789 32.2666 67.2673 31.7436 66.8921 31.0728C66.5169 30.3906 66.3293 29.6118 66.3293 28.7363C66.3293 27.8381 66.5169 27.0536 66.8921 26.3828C67.2786 25.712 67.796 25.189 68.444 24.8138C69.1035 24.4386 69.8368 24.251 70.6441 24.251C71.4741 24.251 72.2131 24.4386 72.8612 24.8138C73.5093 25.189 74.0209 25.712 74.3961 26.3828C74.7713 27.0536 74.9589 27.8381 74.9589 28.7363C74.9589 29.6118 74.7713 30.3906 74.3961 31.0728C74.0209 31.7436 73.5036 32.2666 72.8442 32.6419C72.1961 33.0171 71.457 33.2047 70.627 33.2047ZM70.6441 31.448C71.0534 31.448 71.4229 31.3457 71.7527 31.141C72.0937 30.9364 72.3666 30.6351 72.5713 30.2371C72.7759 29.8278 72.8783 29.3219 72.8783 28.7193C72.8783 28.1167 72.7759 27.6164 72.5713 27.2185C72.378 26.8205 72.1108 26.5192 71.7697 26.3146C71.4286 26.1099 71.0591 26.0076 70.6612 26.0076C70.2632 26.0076 69.8937 26.1099 69.5526 26.3146C69.2115 26.5192 68.9386 26.8205 68.734 27.2185C68.5293 27.6164 68.427 28.1167 68.427 28.7193C68.427 29.3219 68.5293 29.8278 68.734 30.2371C68.9386 30.6351 69.2058 30.9364 69.5355 31.141C69.8766 31.3457 70.2462 31.448 70.6441 31.448ZM76.4507 33V24.4556H78.2755L78.4631 26.0587C78.6678 25.6722 78.9179 25.3481 79.2135 25.0866C79.5205 24.8138 79.8787 24.6091 80.288 24.4727C80.6973 24.3249 81.1521 24.251 81.6524 24.251V26.3998H80.9872C80.6348 26.3998 80.305 26.4453 79.9981 26.5363C79.6911 26.6159 79.4239 26.7523 79.1965 26.9456C78.9691 27.1275 78.7929 27.3833 78.6678 27.7131C78.5541 28.0428 78.4972 28.4521 78.4972 28.941V33H76.4507ZM86.3047 33.2047C85.5088 33.2047 84.7982 33.0114 84.1729 32.6248C83.5589 32.2382 83.07 31.7038 82.7062 31.0217C82.3537 30.3395 82.1775 29.572 82.1775 28.7193C82.1775 27.8552 82.3537 27.0877 82.7062 26.4169C83.07 25.7461 83.5646 25.2174 84.1899 24.8308C84.8266 24.4442 85.5486 24.251 86.3559 24.251C86.9926 24.251 87.5497 24.376 88.0272 24.6262C88.5161 24.8649 88.9027 25.206 89.1869 25.6494V20.7206H91.2335V33H89.4086L89.1869 31.755C89.0164 32.0051 88.8004 32.2439 88.5388 32.4713C88.2773 32.6873 87.9647 32.8636 87.6008 33C87.237 33.1364 86.805 33.2047 86.3047 33.2047ZM86.7481 31.431C87.237 31.431 87.6634 31.3173 88.0272 31.0899C88.4024 30.8511 88.6923 30.5328 88.897 30.1348C89.113 29.7255 89.221 29.2537 89.221 28.7193C89.221 28.1849 89.113 27.7187 88.897 27.3208C88.6923 26.9115 88.4024 26.5931 88.0272 26.3657C87.652 26.1383 87.22 26.0246 86.7311 26.0246C86.2649 26.0246 85.8442 26.1383 85.469 26.3657C85.0938 26.5931 84.7982 26.9115 84.5822 27.3208C84.3775 27.7187 84.2752 28.1849 84.2752 28.7193C84.2752 29.2537 84.3775 29.7255 84.5822 30.1348C84.7982 30.5328 85.0938 30.8511 85.469 31.0899C85.8442 31.3173 86.2706 31.431 86.7481 31.431Z" fill="currentColor" />
            </svg>
          </a>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-[800px] px-8 py-10">
        {/* Meeting breadcrumb */}
        <div className="mb-6">
          <p className="text-[13px] text-muted">
            {bundle.meetingTitle} &middot; {bundle.meetingDate}
          </p>
        </div>

        {/* Ticket card */}
        <div className="rounded-xl border border-border bg-card p-8">
          {/* Header row */}
          <div className="mb-4 flex items-center gap-3">
            <span className="text-sm font-medium text-muted">{ticket.id}</span>
            <span
              className="rounded px-2 py-0.5 text-[11px] font-semibold uppercase"
              style={{
                backgroundColor:
                  ticket.priority === "High" ? "#FEF2F2" :
                  ticket.priority === "Med" ? "#FDF6E3" : "#EFF6FF",
                color:
                  ticket.priority === "High" ? "#B91C1C" :
                  ticket.priority === "Med" ? "#B5860B" : "#1D4ED8",
              }}
            >
              {ticket.priority}
            </span>
            {ticket.status && (
              <span className="rounded-full border border-border px-3 py-0.5 text-xs font-medium text-muted">
                {ticket.status}
              </span>
            )}
          </div>

          {/* Title */}
          <h1
            className="mb-8 text-foreground"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "28px",
              letterSpacing: "-0.5px",
              lineHeight: "36px",
              fontWeight: 400,
            }}
          >
            {ticket.title}
          </h1>

          {/* Original Problem */}
          <div className="mb-8 overflow-hidden rounded-lg border border-border">
            <div className="flex">
              <div className="w-1 shrink-0" style={{ backgroundColor: ticket.problemColor }} />
              <div className="flex-1 p-4">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ticket.problemColor }} />
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: ticket.problemColor }}>
                    Original Problem
                  </p>
                </div>
                <h3 className="text-sm font-semibold text-foreground">{ticket.problemTitle}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">{ticket.problemDescription}</p>
                {ticket.problemQuotes && ticket.problemQuotes.length > 0 && (
                  <div className="mt-3 border-t border-border pt-3">
                    {ticket.problemQuotes.slice(0, 2).map((q, i) => (
                      <p key={i} className="mt-1.5 text-[12px] italic text-muted">
                        &ldquo;{q.text}&rdquo; &mdash; {q.speaker}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Problem Statement */}
          {ticket.problemStatement && (
            <div className="mb-8">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                Problem Statement
              </h2>
              <p className="text-sm leading-relaxed text-foreground">{ticket.problemStatement}</p>
            </div>
          )}

          {/* Description */}
          {ticket.description && (
            <div className="mb-8">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                Description
              </h2>
              <p className="text-sm leading-relaxed text-foreground">{ticket.description}</p>
            </div>
          )}

          {/* Acceptance Criteria */}
          {ticket.acceptanceCriteria && ticket.acceptanceCriteria.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                Acceptance Criteria
              </h2>
              <ul className="flex flex-col gap-2.5">
                {ticket.acceptanceCriteria.map((ac, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted/40" />
                    <span className="text-sm leading-relaxed text-foreground">{ac}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* User Quotes */}
          {ticket.quotes && ticket.quotes.length > 0 && (
            <div>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                Supporting Evidence
              </h2>
              <div className="flex flex-col gap-3">
                {ticket.quotes.map((q, i) => (
                  <div key={i} className="rounded-lg border border-border bg-background p-4">
                    <p className="text-sm italic leading-relaxed text-foreground">
                      &ldquo;{q.text}&rdquo;
                    </p>
                    <p className="mt-2 text-xs text-muted">{q.speaker}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-8 py-6">
        <div className="mx-auto flex max-w-[800px] items-center justify-between">
          <p className="text-xs text-muted">
            Created with{" "}
            <a
              href="https://fijord.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent hover:text-accent/80"
            >
              Fjord
            </a>
          </p>
          <p className="text-xs text-muted">
            Expires {expiresAt}
          </p>
        </div>
      </footer>
    </div>
  );
}
