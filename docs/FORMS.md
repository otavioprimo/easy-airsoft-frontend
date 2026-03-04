# Formulários com React Hook Form e Zod

## 🎯 Visão Geral

O projeto usa **react-hook-form** para gerenciamento de formulários e **Zod** para validação de schemas.

## 📦 Dependências

```bash
npm install react-hook-form zod @hookform/resolvers
```

## 🚀 Exemplo Básico

### 1. Criar Schema de Validação

```tsx
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;
```

### 2. Usar no Componente

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    console.log(data); // { email: "...", password: "..." }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" {...register("password")} />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Entrar</button>
    </form>
  );
}
```

## 🎨 Com Componentes Personalizados

### Usando o FormField

```tsx
import { FormField } from "@/components/ui/form-field";

function MyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField
        label="E-mail"
        type="email"
        placeholder="seu@email.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <FormField
        label="Senha"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register("password")}
      />

      <Button type="submit">Enviar</Button>
    </form>
  );
}
```

## 📋 Validações Comuns com Zod

### String

```tsx
z.string()
  .min(3, "Mínimo 3 caracteres")
  .max(100, "Máximo 100 caracteres")
  .email("E-mail inválido")
  .url("URL inválida")
  .regex(/^[a-z]+$/, "Apenas letras minúsculas")
  .trim() // Remove espaços
  .toLowerCase(); // Converte para minúsculas
```

### Número

```tsx
z.number()
  .min(18, "Idade mínima: 18 anos")
  .max(100, "Idade máxima: 100 anos")
  .positive("Deve ser positivo")
  .int("Deve ser inteiro");
```

### Boolean

```tsx
z.boolean().refine((val) => val === true, "Você deve aceitar os termos");
```

### Date

```tsx
z.date()
  .min(new Date("2000-01-01"), "Data muito antiga")
  .max(new Date(), "Data não pode ser futura");
```

### Enum

```tsx
z.enum(["admin", "user", "guest"]);
```

### Array

```tsx
z.array(z.string())
  .min(1, "Selecione pelo menos 1 item")
  .max(5, "Máximo 5 itens");
```

### Object Aninhado

```tsx
const addressSchema = z.object({
  street: z.string(),
  number: z.string(),
  city: z.string(),
});

const userSchema = z.object({
  name: z.string(),
  address: addressSchema,
});
```

### Union (OU)

```tsx
z.union([z.string(), z.number()]);
// ou
z.string().or(z.number());
```

### Optional

```tsx
z.string().optional(); // string | undefined
z.string().nullable(); // string | null
z.string().nullish(); // string | null | undefined
```

### Transform

```tsx
z.string().transform((val) => val.trim().toLowerCase());
```

### Refinamento Personalizado

```tsx
z.string().refine((val) => val.includes("@"), "Deve conter @");
```

### Validação Assíncrona

```tsx
z.string().refine(async (email) => {
  const exists = await checkEmailExists(email);
  return !exists;
}, "E-mail já cadastrado");
```

## 🔧 Recursos Avançados

### Valores Padrão

```tsx
const { register } = useForm({
  defaultValues: {
    email: "default@email.com",
    remember: true,
  },
});
```

### Reset do Formulário

```tsx
const { reset } = useForm();

const onSuccess = () => {
  reset(); // Limpa o formulário
};
```

### Watch (Observar Valores)

```tsx
const { watch } = useForm();

const password = watch("password");
const allValues = watch(); // Todos os valores
```

### SetValue (Setar Valores)

```tsx
const { setValue } = useForm();

setValue("email", "novo@email.com");
```

### Validação Manual

```tsx
const { trigger } = useForm();

// Valida um campo específico
await trigger("email");

// Valida todos os campos
await trigger();
```

### Modo de Validação

```tsx
const { register } = useForm({
  mode: "onChange", // Valida ao digitar
  // mode: "onBlur",  // Valida ao sair do campo
  // mode: "onSubmit", // Valida ao submeter (padrão)
});
```

## 📝 Exemplo Completo: Formulário de Registro

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const registerSchema = z
  .object({
    name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
    confirmPassword: z.string(),
    terms: z
      .boolean()
      .refine((val) => val === true, "Você deve aceitar os termos"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await api.post("/auth/register", data);
      console.log("Sucesso!");
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        label="Nome"
        {...register("name")}
        error={errors.name?.message}
      />

      <FormField
        label="E-mail"
        type="email"
        {...register("email")}
        error={errors.email?.message}
      />

      <FormField
        label="Senha"
        type="password"
        {...register("password")}
        error={errors.password?.message}
      />

      <FormField
        label="Confirmar Senha"
        type="password"
        {...register("confirmPassword")}
        error={errors.confirmPassword?.message}
      />

      <div className="flex items-center gap-2">
        <input type="checkbox" id="terms" {...register("terms")} />
        <label htmlFor="terms">Aceito os termos</label>
      </div>
      {errors.terms && (
        <p className="text-sm text-red-600">{errors.terms.message}</p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Cadastrando..." : "Cadastrar"}
      </Button>
    </form>
  );
}
```

## 🎯 Boas Práticas

1. **Sempre use TypeScript** com `z.infer<typeof schema>` para type safety
2. **Mensagens em português** para melhor UX
3. **Feedback visual** para campos com erro (border vermelho)
4. **Disabled no submit** durante carregamento
5. **Reset após sucesso** para limpar o formulário
6. **Validação no cliente** para UX rápida
7. **Validação no servidor** para segurança

## 🔗 Links Úteis

- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Docs](https://zod.dev/)
- [Exemplos no LoginPage](../pages/LoginPage.tsx)
