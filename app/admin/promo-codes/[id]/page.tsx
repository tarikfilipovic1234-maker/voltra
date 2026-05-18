import { notFound } from "next/navigation";

import { savePromoCode } from "@/app/actions/admin-loyalty";
import { prisma } from "@/lib/prisma";
import { CheckField, Field } from "@/app/components/admin/Field";
import { FormShell } from "@/app/components/admin/FormShell";

function toLocalDT(d: Date | null | undefined) {
  if (!d) return "";
  return d.toISOString().slice(0, 16);
}

export default async function EditPromoCodePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const code = await prisma.promoCode.findUnique({ where: { id } });
  if (!code) notFound();

  return (
    <FormShell title={`Edit · ${code.code}`} eyebrow={`§ Promo · ${code.redeemedCount}/${code.maxRedemptions} redeemed`} backHref="/admin/promo-codes">
      <form
        action={async (fd) => {
          "use server";
          await savePromoCode(id, fd);
        }}
        className="grid gap-6"
      >
        <Field label="Code" name="code" required defaultValue={code.code} />
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Points awarded" name="points" type="number" defaultValue={code.points} required />
          <Field label="Max redemptions" name="maxRedemptions" type="number" defaultValue={code.maxRedemptions} required />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            label="Source"
            name="source"
            defaultValue={code.source}
            options={["CAN", "EVENT", "EMAIL", "PARTNER"].map((s) => ({ value: s, label: s }))}
          />
          <Field label="Expires At" name="expiresAt" type="datetime-local" defaultValue={toLocalDT(code.expiresAt)} />
        </div>
        <Field label="Campaign" name="campaign" defaultValue={code.campaign ?? ""} />
        <CheckField name="active" label="Active" defaultChecked={code.active} />
        <div className="flex items-center gap-3 border-t border-border pt-6">
          <button
            type="submit"
            className="clip-sharp inline-flex items-center gap-3 bg-voltra px-7 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black hover:bg-voltra-acid"
          >
            Save →
          </button>
          <a href="/admin/promo-codes" className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim hover:text-text">Cancel</a>
        </div>
      </form>
    </FormShell>
  );
}
