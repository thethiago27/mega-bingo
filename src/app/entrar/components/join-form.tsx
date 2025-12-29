"use client";

import { useForm, revalidateLogic } from "@tanstack/react-form";
import { InputField } from "@/components/input-field";
import { z } from "zod";
import { ArrowRight, Hash, User } from "lucide-react";
import PrimaryButton from "@/components/PrimaryButton";
import { useRouter } from "next/navigation";
import { FieldGroup } from "@/components/ui/field";
import { checkRoomExists } from "@/lib/database";

const formSchema = z.object({
  salaId: z.string().min(5, "Sala inválida").trim(),
  nome: z.string().min(5, "Nome muito curto").trim(),
});

export function JoinForm() {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      salaId: "",
      nome: "",
    },
    // Habilita a validação dinâmica conforme a documentação
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      router.push(
        `/sala/${value.salaId}?nome=${encodeURIComponent(value.nome)}`,
      );
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="flex flex-col gap-5"
    >
      <FieldGroup>
        <form.Field
          name="salaId"
          validators={{
            onDynamicAsyncDebounceMs: 500,
            onDynamicAsync: async ({ value }) => {
              if (!value || value.length < 5) {
                return undefined;
              }

              const roomExists = await checkRoomExists(value);

              if (!roomExists) {
                return "Sala não encontrada!";
              }

              return undefined;
            },
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-2">
              <InputField
                id={field.name}
                label="Código da Sala"
                placeholder="Digite o código da sala"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                icon={Hash}
                required
              />
              {field.state.meta.errors.map((error, i) => (
                <p key={i} className="text-red-500 text-sm">
                  {typeof error === "string" ? error : error?.message}
                </p>
              ))}

              {field.state.meta.isValidating && (
                <p className="text-gray-500 text-sm">Verificando sala...</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="nome">
          {(field) => (
            <div className="flex flex-col gap-2">
              <InputField
                id={field.name}
                label="Nome do Jogador"
                placeholder="Digite seu nome ou apelido"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                icon={User}
                required
              />
              {/* Exibe erros de validação */}
              {field.state.meta.errors.map((error, i) => (
                <p key={i} className="text-red-500 text-sm">
                  {typeof error === "string" ? error : error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>
      </FieldGroup>

      <form.Subscribe>
        {({ isSubmitting, isFormValid }) => (
          <PrimaryButton
            type="submit"
            icon={ArrowRight}
            disabled={isSubmitting || !isFormValid}
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </PrimaryButton>
        )}
      </form.Subscribe>
    </form>
  );
}
