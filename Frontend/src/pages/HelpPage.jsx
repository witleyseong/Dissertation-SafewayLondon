// support contacts, phone links open the dialler on mobile
const SECTIONS = [
    {
        title: "Emergency",
        emergency: true,
        items: [
            { title: "Emergency services", description: "If you or someone else is in immediate danger.", phone: "999" },
        ],
    },
    {
        title: "Police and crime reporting",
        items: [
            { title: "Non-emergency police", description: "Report something that is not an emergency.", phone: "101" },
            {
                title: "Report a crime online",
                description: "Metropolitan Police online reporting.",
                url: "https://www.met.police.uk/ro/report/ocr/af/how-to-report-a-crime/",
            },
        ],
    },
    {
        title: "Mental health and NHS support",
        items: [
            {
                title: "Urgent mental health support",
                description: "NHS 111, available 24 hours a day.",
                phone: "111",
                url: "https://www.nhs.uk/nhs-services/mental-health-services/where-to-get-urgent-help-for-mental-health/",
            },
            {
                title: "Talk to Samaritans",
                description: "Free, confidential support, any time.",
                phone: "116 123",
                url: "https://www.samaritans.org/how-we-can-help/contact-samaritan/",
            },
            { title: "NHS mental health services", description: "Find services near you.", url: "https://www.nhs.uk/nhs-services/mental-health-services/" },
        ],
    },
];

export default function HelpPage() {
    return (
        <div className="page">
            <h1>Help and support</h1>
            <p className="muted">Useful contacts in London. SafeWay London is not an emergency service.</p>

            {SECTIONS.map((section) => (
                <section key={section.title}>
                    <h2>{section.title}</h2>
                    <div className="support-grid">
                        {section.items.map((item) => (
                            <article key={item.title} className={`card support-card${section.emergency ? " emergency" : ""}`}>
                                <h3>{item.title}</h3>
                                <p className="muted">{item.description}</p>
                                <div className="support-actions">
                                    {item.phone && (
                                        <a className={`button small${section.emergency ? " danger" : " primary"}`} href={`tel:${item.phone.replace(/\s/g, "")}`}>
                                            Call {item.phone}
                                        </a>
                                    )}
                                    {item.url && (
                                        <a className="button small" href={item.url} target="_blank" rel="noreferrer">
                                            Website
                                        </a>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
