import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import EquipmentNewForm from "@/components/equipment-new-form";

export default async function NewGearPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/gear/new");

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/gear" className="text-sm text-pack-brown hover:text-pack-mask">
        ← Back to gear
      </Link>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-pack-mask">
        List an item
      </h1>
      <p className="mt-1 text-sm text-pack-brown">
        Sell working-dog equipment to the community. Add a clear photo if you
        can — listings with photos sell faster.
      </p>

      <div className="mt-6">
        <EquipmentNewForm userId={user.id} />
      </div>
    </div>
  );
}
