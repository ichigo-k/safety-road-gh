'use client';

import React, { useEffect, useState } from 'react';
import {
    CheckCircle2,
    Eye,
    EyeOff,
    KeyRound,
    Loader2,
    Mail,
    Phone,
    Shield,
    User,
} from 'lucide-react';

/* ── tiny helpers ─────────────────────────────────────────────────────── */
function getToken() {
    return typeof window !== 'undefined' ? localStorage.getItem('adminToken') ?? '' : '';
}

function initials(name: string) {
    return name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

/* ── reusable field row ───────────────────────────────────────────────── */
function Field({
    label,
    htmlFor,
    children,
}: {
    label: string;
    htmlFor?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="grid gap-1.5 sm:grid-cols-[200px_1fr] sm:items-start">
            <label
                htmlFor={htmlFor}
                className="pt-2.5 text-body font-medium text-ink-700 sm:text-right"
            >
                {label}
            </label>
            <div>{children}</div>
        </div>
    );
}

const inputCls =
    'w-full rounded-sm border border-line bg-surface px-3.5 py-2.5 text-body text-ink-900 outline-none placeholder:text-ink-400 focus:border-brand transition-colors';

/* ── password input with show/hide toggle ─────────────────────────────── */
function PasswordInput({
    id,
    value,
    onChange,
    placeholder,
    autoComplete,
}: {
    id: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    autoComplete?: string;
}) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <input
                id={id}
                type={show ? 'text' : 'password'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                autoComplete={autoComplete}
                className={`${inputCls} pr-10`}
            />
            <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition-colors"
            >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
        </div>
    );
}

/* ── inline toast ─────────────────────────────────────────────────────── */
function Toast({
    message,
    type,
}: {
    message: string;
    type: 'ok' | 'error';
}) {
    return (
        <div
            role="alert"
            className={`flex items-center gap-2.5 rounded-sm px-4 py-3 text-body ${type === 'ok'
                    ? 'bg-ok-soft text-ok'
                    : 'bg-danger-soft text-danger-dark'
                }`}
        >
            {type === 'ok' && <CheckCircle2 className="h-4 w-4 shrink-0" />}
            {message}
        </div>
    );
}

/* ── section card ─────────────────────────────────────────────────────── */
function Section({
    title,
    icon: Icon,
    children,
}: {
    title: string;
    icon: typeof User;
    children: React.ReactNode;
}) {
    return (
        <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-subtle">
            <div className="flex items-center gap-2.5 border-b border-line px-6 py-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-xs bg-brand-soft">
                    <Icon className="h-3.5 w-3.5 text-brand" strokeWidth={2.2} />
                </span>
                <h2 className="text-base font-semibold text-ink-900">{title}</h2>
            </div>
            <div className="px-6 py-6">{children}</div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════ */

export default function AdminProfilePage() {
    /* profile state */
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('');
    const [loadingProfile, setLoadingProfile] = useState(true);

    /* password state */
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    /* feedback */
    const [infoMsg, setInfoMsg] = useState<{ text: string; type: 'ok' | 'error' } | null>(null);
    const [pwMsg, setPwMsg] = useState<{ text: string; type: 'ok' | 'error' } | null>(null);
    const [savingInfo, setSavingInfo] = useState(false);
    const [savingPw, setSavingPw] = useState(false);

    /* ── load profile ──────────────────────────────────────────────────── */
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/v1/auth/me', {
                    headers: { Authorization: `Bearer ${getToken()}` },
                });
                const data = await res.json();
                if (res.ok && data.user) {
                    setFullName(data.user.full_name ?? '');
                    setEmail(data.user.email ?? '');
                    setPhone(data.user.phone ?? '');
                    setRole(data.user.role ?? '');
                }
            } catch {
                /* silent — form stays empty */
            } finally {
                setLoadingProfile(false);
            }
        })();
    }, []);

    /* ── save profile info ─────────────────────────────────────────────── */
    const handleSaveInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingInfo(true);
        setInfoMsg(null);
        try {
            const res = await fetch('/api/v1/auth/me', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({ full_name: fullName, email, phone }),
            });
            const data = await res.json();
            if (res.ok) {
                setInfoMsg({ text: 'Profile updated successfully.', type: 'ok' });
                // Keep localStorage in sync so the sidebar shows the right name.
                const stored = localStorage.getItem('adminUser');
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        localStorage.setItem(
                            'adminUser',
                            JSON.stringify({ ...parsed, full_name: fullName, email }),
                        );
                    } catch {
                        /* ignore */
                    }
                }
            } else {
                setInfoMsg({ text: data.error ?? 'Failed to update profile.', type: 'error' });
            }
        } catch {
            setInfoMsg({ text: 'Network error. Please try again.', type: 'error' });
        } finally {
            setSavingInfo(false);
        }
    };

    /* ── change password ───────────────────────────────────────────────── */
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwMsg(null);

        if (newPassword !== confirmPassword) {
            setPwMsg({ text: 'New passwords do not match.', type: 'error' });
            return;
        }
        if (newPassword.length < 8) {
            setPwMsg({ text: 'Password must be at least 8 characters.', type: 'error' });
            return;
        }

        setSavingPw(true);
        try {
            const res = await fetch('/api/v1/auth/me', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await res.json();
            if (res.ok) {
                setPwMsg({ text: 'Password changed successfully.', type: 'ok' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setPwMsg({ text: data.error ?? 'Failed to change password.', type: 'error' });
            }
        } catch {
            setPwMsg({ text: 'Network error. Please try again.', type: 'error' });
        } finally {
            setSavingPw(false);
        }
    };

    /* ── skeleton ──────────────────────────────────────────────────────── */
    if (loadingProfile) {
        return (
            <div className="mx-auto max-w-2xl space-y-6">
                {[1, 2].map((i) => (
                    <div key={i} className="overflow-hidden rounded-lg border border-line bg-surface shadow-subtle">
                        <div className="border-b border-line px-6 py-4">
                            <div className="skeleton h-5 w-40" />
                        </div>
                        <div className="space-y-5 px-6 py-6">
                            {[1, 2, 3].map((j) => (
                                <div key={j} className="grid gap-1.5 sm:grid-cols-[200px_1fr]">
                                    <div className="skeleton h-4 w-28 sm:ml-auto" />
                                    <div className="skeleton h-10 w-full rounded-sm" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6">

            {/* ── Page header ──────────────────────────────────────────────── */}
            <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-md bg-panel text-heading font-semibold text-brand-on-dark">
                    {initials(fullName || 'Admin User')}
                </span>
                <div>
                    <h1 className="text-display font-semibold tracking-tight text-ink-900">
                        {fullName || 'Your profile'}
                    </h1>
                    <p className="mt-0.5 flex items-center gap-1.5 text-body text-ink-500">
                        <Shield className="h-3.5 w-3.5 text-brand" strokeWidth={2.2} />
                        {role === 'ADMIN' ? 'Administrator' : role === 'RESPONDER' ? 'Responder' : role}
                    </p>
                </div>
            </div>

            {/* ── Account info ─────────────────────────────────────────────── */}
            <Section title="Account details" icon={User}>
                <form onSubmit={handleSaveInfo} className="space-y-5">
                    <Field label="Full name" htmlFor="full-name">
                        <div className="relative">
                            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                            <input
                                id="full-name"
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Your full name"
                                className={`${inputCls} pl-10`}
                            />
                        </div>
                    </Field>

                    <Field label="Email address" htmlFor="email">
                        <div className="relative">
                            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@agency.gov.gh"
                                className={`${inputCls} pl-10`}
                            />
                        </div>
                    </Field>

                    <Field label="Phone number" htmlFor="phone">
                        <div className="relative">
                            <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                            <input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+233 24 000 0000"
                                className={`${inputCls} pl-10`}
                            />
                        </div>
                    </Field>

                    {infoMsg && <Toast message={infoMsg.text} type={infoMsg.type} />}

                    <div className="flex justify-end border-t border-line pt-4">
                        <button
                            type="submit"
                            disabled={savingInfo}
                            className="inline-flex h-10 items-center gap-2 rounded-sm bg-brand px-5 text-body font-semibold text-white transition-colors hover:bg-brand-press disabled:opacity-50"
                        >
                            {savingInfo && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            {savingInfo ? 'Saving…' : 'Save changes'}
                        </button>
                    </div>
                </form>
            </Section>

            {/* ── Change password ───────────────────────────────────────────── */}
            <Section title="Change password" icon={KeyRound}>
                <form onSubmit={handleChangePassword} className="space-y-5">
                    <Field label="Current password" htmlFor="current-pw">
                        <PasswordInput
                            id="current-pw"
                            value={currentPassword}
                            onChange={setCurrentPassword}
                            placeholder="Your current password"
                            autoComplete="current-password"
                        />
                    </Field>

                    <Field label="New password" htmlFor="new-pw">
                        <PasswordInput
                            id="new-pw"
                            value={newPassword}
                            onChange={setNewPassword}
                            placeholder="At least 8 characters"
                            autoComplete="new-password"
                        />
                    </Field>

                    <Field label="Confirm new password" htmlFor="confirm-pw">
                        <PasswordInput
                            id="confirm-pw"
                            value={confirmPassword}
                            onChange={setConfirmPassword}
                            placeholder="Repeat new password"
                            autoComplete="new-password"
                        />
                    </Field>

                    {pwMsg && <Toast message={pwMsg.text} type={pwMsg.type} />}

                    <div className="flex justify-end border-t border-line pt-4">
                        <button
                            type="submit"
                            disabled={savingPw}
                            className="inline-flex h-10 items-center gap-2 rounded-sm bg-brand px-5 text-body font-semibold text-white transition-colors hover:bg-brand-press disabled:opacity-50"
                        >
                            {savingPw && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            {savingPw ? 'Updating…' : 'Update password'}
                        </button>
                    </div>
                </form>
            </Section>
        </div>
    );
}
