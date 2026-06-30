import { Link } from "react-router-dom";
import { useEffect } from "react";
import nvLogo from "../images/nvlogo-v1.png";

const officialReferences = [
    {
        label: "FTC Privacy & Security Guidance",
        href: "https://www.ftc.gov/business-guidance/privacy-security",
    },
    {
        label: "India Data Protection Framework",
        href: "https://www.meity.gov.in/data-protection-framework",
    },
    {
        label: "European Commission Data Protection",
        href: "https://commission.europa.eu/law/law-topic/data-protection_en",
    },
];

const watermarkPositions = [
    ["6%", "8%", "110px"],
    ["78%", "10%", "140px"],
    ["42%", "20%", "120px"],
    ["12%", "34%", "150px"],
    ["68%", "38%", "115px"],
    ["88%", "52%", "130px"],
    ["28%", "58%", "125px"],
    ["8%", "74%", "120px"],
    ["54%", "82%", "145px"],
    ["82%", "88%", "110px"],
];

export default function LegalInformation() {
    useEffect(() => {
        const scrollToHash = () => {
            const id = window.location.hash.replace("#", "");
            if (!id) return;

            window.requestAnimationFrame(() => {
                document.getElementById(id)?.scrollIntoView({
                    block: "start",
                    behavior: "smooth",
                });
            });
        };

        scrollToHash();
        window.addEventListener("hashchange", scrollToHash);

        return () => {
            window.removeEventListener("hashchange", scrollToHash);
        };
    }, []);

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#fff8f2] px-4 pb-16 pt-36 lg:pt-44">
            <div className="pointer-events-none fixed inset-0 z-[20]" aria-hidden="true">
                {watermarkPositions.map(([left, top, size], index) => (
                    <img
                        key={`${left}-${top}-${index}`}
                        src={nvLogo}
                        alt=""
                        className="absolute rounded-full object-cover opacity-[0.07] mix-blend-multiply"
                        style={{
                            left,
                            top,
                            width: size,
                            height: size,
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 mx-auto max-w-5xl">
                <nav className="mb-4 text-sm font-medium text-gray-500">
                    <Link to="/" className="hover:text-[#800020]">
                        Home
                    </Link>
                    <span className="mx-2 text-amber-600">/</span>
                    <span className="text-[#800020]">Privacy, Terms & Legal Information</span>
                </nav>

                <section className="rounded-2xl bg-white p-6 shadow-lg sm:p-8">
                    <p className="text-sm font-bold uppercase tracking-wide text-amber-700">
                        User Information Notice
                    </p>
                    <h1 className="mt-2 text-3xl font-bold text-[#800020] sm:text-4xl">
                        Privacy, Terms & Legal Information
                    </h1>
                    <p className="mt-4 text-gray-700">
                        This page explains how NichayaVedika collects, stores, protects, uses,
                        and manages personal information for registration, profile management,
                        matchmaking, support, security, and legal or operational purposes.
                    </p>
                    <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-gray-700">
                        This information is provided for transparency and user awareness. It
                        should be reviewed by a qualified legal professional before being used as
                        a final legal policy.
                    </p>
                </section>

                <div className="mt-6 grid gap-5">
                    <LegalSection title="1. Information We Collect">
                        <p>
                            NichayaVedika may collect registration details such as name, mobile
                            number, email address, password, gender, and relationship to the
                            profile being registered. Profile details may include age, date of
                            birth, height, caste, sub-caste, gothram, education, occupation,
                            income range, location, family details, partner preferences, photos,
                            and communication preferences.
                        </p>
                        <p>
                            We may also record consent choices, account status, membership status,
                            admin review status, profile activity, support requests, and technical
                            information needed for security and service operation.
                        </p>
                    </LegalSection>

                    <LegalSection title="2. Purpose of Collection and Use" id="privacy" sectionHeading="Privacy">
                        <p>
                            Personal information is used to create and manage matrimony profiles,
                            verify profiles, display suitable search results, allow interested
                            families to connect, provide customer support, prevent misuse, manage
                            memberships, and comply with legal, security, and operational needs.
                        </p>
                        <p>
                            NichayaVedika should not use personal information for unrelated
                            purposes unless the user is notified and gives appropriate consent
                            where required.
                        </p>
                    </LegalSection>

                    <LegalSection title="3. Platform Purpose and Acceptable Use" id="purpose" sectionHeading="Matrimony Purpose">
                        <p>
                            NichayaVedika is intended only for genuine matrimonial introductions,
                            family-supported marriage discussions, and related profile discovery.
                            It is not a dating app, casual friendship app, social media platform,
                            employment platform, religious campaign platform, political platform,
                            or place for unrelated promotion.
                        </p>
                        <p>
                            Users should use the service respectfully and only for lawful,
                            genuine matrimony purposes. Any use that misleads families, pressures
                            users, harasses members, promotes unrelated agendas, or harms trust in
                            the community may result in profile rejection, restriction, or
                            deactivation.
                        </p>
                    </LegalSection>

                    <LegalSection title="4. Accuracy, False Information, and Media Rules" id="rules" sectionHeading="Safety Rules">
                        <p>
                            Users must provide truthful and current information, including name,
                            age, marital status, education, occupation, family details, location,
                            caste/community details where voluntarily provided, and partner
                            preferences. False, incomplete, misleading, impersonated, or copied
                            information is not allowed.
                        </p>
                        <p>
                            Uploaded photos and media must belong to the profile owner or be
                            uploaded with proper permission. Edited, misleading, offensive,
                            unrelated, stolen, celebrity, AI-generated impersonation, or
                            inappropriate media may be hidden, rejected, or removed by admins.
                        </p>
                    </LegalSection>

                    <LegalSection title="5. Protected Cloud Storage">
                        <p>
                            NichayaVedika may store and process personal information on protected
                            cloud platforms. We aim to use reasonable administrative, technical,
                            and organizational safeguards to reduce unauthorized access, loss,
                            misuse, alteration, or disclosure.
                        </p>
                        <p>
                            No digital system can guarantee absolute security. Users should also
                            protect their passwords, avoid sharing login credentials, and report
                            suspicious activity to support.
                        </p>
                    </LegalSection>

                    <LegalSection title="6. Consent and User Choice">
                        <p>
                            During login or registration, users are asked to acknowledge that
                            their information may be collected, stored, and processed for
                            profile-related services. Consent records should ideally include the
                            user account, timestamp, accepted policy version, and consent type.
                        </p>
                        <p>
                            Users with privacy concerns should contact NichayaVedika support
                            before continuing with registration or profile use.
                        </p>
                    </LegalSection>

                    <LegalSection title="7. Photo Visibility Consent">
                        <p>
                            Users may choose whether uploaded photos can be shown to other brides
                            or grooms. If consent is not given, photos should be hidden from
                            member-facing profile cards, search results, and profile views.
                            Admins may still access photos where needed for verification,
                            moderation, support, legal, or operational purposes.
                        </p>
                    </LegalSection>

                    <LegalSection title="8. Profile Approval, Rejection, and Deactivation">
                        <p>
                            Profiles may be reviewed by admins before appearing in public search.
                            NichayaVedika may approve, reject, edit, or deactivate profiles to
                            protect users, maintain quality, prevent misuse, or comply with
                            service rules.
                        </p>
                        <p>
                            A deactivated profile should not appear in public search or normal
                            member browsing, but records may be retained where needed for legal,
                            security, dispute-resolution, fraud-prevention, or operational
                            purposes.
                        </p>
                    </LegalSection>

                    <LegalSection title="9. Data Retention and Deletion Requests">
                        <p>
                            Information may be maintained while the profile or records are active.
                            After deactivation, some information may be retained for a reasonable
                            period when required for legal, security, accounting, dispute,
                            operational, or fraud-prevention purposes.
                        </p>
                        <p>
                            Users may contact support to request deactivation, correction, or
                            deletion of profile information, subject to identity verification and
                            applicable legal or operational retention requirements.
                        </p>
                    </LegalSection>

                    <LegalSection title="10. Terms & User Responsibilities" id="terms" sectionHeading="Terms">
                        <p>
                            Users are expected to provide accurate information, upload appropriate
                            photos, use the platform only for genuine matrimonial purposes, avoid
                            harassment or misuse, respect other members' privacy, and not copy,
                            scrape, sell, or misuse profile information.
                        </p>
                        <p>
                            Users must not use NichayaVedika for dating, casual chat, commercial
                            solicitation, religious or political campaigning, fake profiles,
                            misleading photos, unlawful content, abusive messages, or collecting
                            other members' data outside the intended matrimonial context.
                        </p>
                    </LegalSection>

                    <LegalSection title="11. Sharing and Disclosure">
                        <p>
                            Profile information may be visible to other users according to account
                            type, membership status, user consent, privacy settings, and admin
                            approval. NichayaVedika may share information with service providers
                            such as cloud hosting, payment, messaging, analytics, email, support,
                            or security providers where required to operate the service.
                        </p>
                        <p>
                            Information may also be disclosed if required by law, court order,
                            regulatory request, fraud prevention, safety investigation, or to
                            protect the rights and security of users or NichayaVedika.
                        </p>
                    </LegalSection>

                    <LegalSection title="12. Grievance and Support Contact">
                        <p>
                            For privacy concerns, profile deactivation, correction requests, photo
                            visibility concerns, or account-support issues, users may contact:
                        </p>
                        <p className="font-bold text-[#800020]">
                            support@nichayavedika.com
                        </p>
                        <p>
                            A final Privacy Policy should include the official grievance/contact
                            officer name, address, email, and response timeline as advised by
                            legal counsel.
                        </p>
                    </LegalSection>

                    <LegalSection title="13. Legal and Regulatory References">
                        <p>
                            NichayaVedika should align its privacy practices with applicable
                            Indian law, including the Digital Personal Data Protection framework,
                            and consider global best practices where users or operations may be
                            outside India.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            {officialReferences.map((reference) => (
                                <a
                                    key={reference.href}
                                    href={reference.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-xl border border-[#800020] px-4 py-2 text-sm font-bold text-[#800020] hover:bg-[#fff8f2]"
                                >
                                    {reference.label}
                                </a>
                            ))}
                        </div>
                    </LegalSection>

                    <LegalSection title="14. Summary Acknowledgement">
                        <p>
                            By registering, logging in, or continuing to use NichayaVedika, users
                            acknowledge that their personal information may be collected, stored,
                            processed, reviewed, and protected using reasonable safeguards for the
                            purposes described on this page.
                        </p>
                    </LegalSection>
                </div>
            </div>
        </main>
    );
}

function LegalSection({ title, children, id, sectionHeading }) {
    return (
        <section id={id} className="scroll-mt-44 rounded-2xl bg-white p-6 shadow">
            {sectionHeading && (
                <p className="mb-2 text-sm font-bold uppercase tracking-wide text-amber-700">
                    {sectionHeading}
                </p>
            )}
            <h2 className="text-xl font-bold text-[#800020]">{title}</h2>
            <div className="mt-3 space-y-3 leading-relaxed text-gray-700">
                {children}
            </div>
        </section>
    );
}
