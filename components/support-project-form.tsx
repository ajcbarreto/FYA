import { saveSupportProject } from "@/app/support/actions";
import { SubmitButton } from "@/components/submit-button";
import type { Database } from "@/lib/supabase/database.types";
type Project = Database["public"]["Tables"]["support_projects"]["Row"];
export function SupportProjectForm({
  locale,
  project,
  animals = [],
}: {
  locale: string;
  project?: Project;
  animals?: { id: string; nome: string }[];
}) {
  const pt = locale === "pt",
    input = "field",
    kind = project?.kind;
  return (
    <form action={saveSupportProject} className="support-panel support-form">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="projectId" value={project?.id ?? ""} />
      <h2 className="text-xl font-bold">
        {project
          ? pt
            ? "Editar campanha ou necessidade"
            : "Edit campaign or need"
          : pt
            ? "Nova campanha ou necessidade"
            : "New campaign or need"}
      </h2>
      {project ? (
        <>
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="unit" value={project.unit} />
          <input
            type="hidden"
            name="animalId"
            value={project.animal_id ?? ""}
          />
          <p>
            {kind === "money"
              ? pt
                ? "Campanha monetária · EUR"
                : "Monetary campaign · EUR"
              : `${pt ? "Bens / serviços" : "Goods / services"} · ${project.unit}`}
          </p>
        </>
      ) : (
        <>
          <label className="block">
            {pt ? "Tipo de apoio" : "Support type"}
            <select name="kind" className={input}>
              <option value="goods">
                {pt ? "Bens ou serviços" : "Goods or services"}
              </option>
              <option value="money">
                {pt ? "Donativos monetários" : "Monetary donations"}
              </option>
            </select>
          </label>
          <label className="block">
            {pt
              ? "Unidade dos bens (ex.: sacos de ração, viagens)"
              : "Goods unit (e.g. bags of food, trips)"}
            <input
              name="unit"
              defaultValue="unidades"
              maxLength={40}
              className={input}
            />
          </label>
          <p className="text-xs">
            {pt
              ? "Para donativos monetários usamos euros; a unidade acima é ignorada."
              : "Monetary donations use euros; the unit above is ignored."}
          </p>
          <label className="block">
            {pt
              ? "Animal associado (opcional)"
              : "Associated animal (optional)"}
            <select name="animalId" className={input}>
              <option value="">—</option>
              {animals.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome}
                </option>
              ))}
            </select>
          </label>
        </>
      )}
      <label className="block">
        {pt ? "Título" : "Title"}
        <input
          name="title"
          required
          minLength={3}
          maxLength={160}
          defaultValue={project?.title}
          className={input}
        />
      </label>
      <label className="block">
        {pt ? "Descrição pública" : "Public description"}
        <textarea
          name="description"
          required
          minLength={10}
          maxLength={4000}
          rows={4}
          defaultValue={project?.description}
          className={input}
        />
      </label>
      <label className="block">
        {pt
          ? "Objetivo (euros para donativos; quantidade inteira para bens)"
          : "Goal (euros for donations; whole quantities for goods)"}
        <input
          name="goal"
          inputMode="decimal"
          required
          defaultValue={
            project
              ? kind === "money"
                ? (project.goal / 100).toFixed(2)
                : project.goal
              : ""
          }
          className={input}
        />
      </label>
      <label className="block">
        {pt
          ? "Ligação externa para donativos (https, opcional)"
          : "External donation link (https, optional)"}
        <input
          name="donation_url"
          type="url"
          maxLength={2000}
          defaultValue={project?.donation_url ?? ""}
          className={input}
        />
      </label>
      <p className="text-xs">
        {pt
          ? "Sem ligação própria, usamos a ligação de donativos configurada no canil. A fotografia é a do animal público associado ou a do canil."
          : "Without a campaign link, the shelter donation link is used. The image is from the associated public animal or the shelter."}
      </p>
      <label className="block">
        {pt ? "Prazo (opcional, inclusive)" : "Deadline (optional, inclusive)"}
        <input
          name="deadline"
          type="date"
          defaultValue={project?.deadline ?? ""}
          className={input}
        />
      </label>
      <label className="block">
        {pt ? "Estado" : "Status"}
        <select
          name="status"
          defaultValue={project?.status ?? "active"}
          className={input}
        >
          <option value="active">{pt ? "Ativa" : "Active"}</option>
          <option value="closed">{pt ? "Fechada" : "Closed"}</option>
        </select>
      </label>
      <label className="flex items-center gap-3">
        <input
          name="published"
          type="checkbox"
          defaultChecked={project?.published ?? false}
        />
        {pt
          ? "Publicar (requer canil verificado)"
          : "Publish (verified shelters only)"}
      </label>
      <SubmitButton className="button-primary">
        {pt ? "Guardar apoio" : "Save support"}
      </SubmitButton>
    </form>
  );
}
