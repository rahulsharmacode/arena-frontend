import { z } from "zod";
const passwordValidation = z
  .string()
  .min(5, { message: "Password must be at least 5 characters long." })
  .regex(/[A-Z]/, {
    message: "Password must contain at least one uppercase letter.",
  })
  .regex(/[a-z]/, {
    message: "Password must contain at least one lowercase letter.",
  })
  .regex(/\d/, { message: "Password must contain at least one number." })
  .regex(/[@$!%*?&]/, {
    message:
      "Password must contain at least one special character (@, $, !, %, *, ?, &).",
  });

const LoginSchema = z.object({
    email:z.string().email(),
    password:z.string().min(3,{message : "Please enter valid password"}),
});

const RegisterSchema = z.object({
    fullName:z.string().min(5, {message:"valid fullname required"}),
    username:z.string().min(5, {message:"username must be minimun of 5"}),
    email:z.string().email(),
    password:passwordValidation,
    confirm_password:z.string()
})  .refine((data) => data.password === data.confirm_password, {
    message: "Password and Confirm password do not match",
    path: ["confirm_password"], // this highlights the error under `confirm_password`
  });



  const ProfileSchema = z.object({
    fullName:z.string().min(5, {message:"valid fullname required"}),
    username:z.string().min(5, {message:"username must be minimun of 5"}),
    bio:z.string().min(5,{message:"bio must be greater then 5 characters"}).max(280),
    image:z.union([z.string(),z.instanceof(File, { message: "Must be a file" }),z.instanceof(Blob, { message: "Must be a file" }),z.any()]).optional()
});


  const ChangePasswordSchema = z.object({
    password:passwordValidation,
    confirm_password:z.string()
})  .refine((data) => data.password === data.confirm_password, {
    message: "Password and Confirm password do not match",
    path: ["confirm_password"], // this highlights the error under `confirm_password`
  });

    const VerifySocialMedia = z.object({
  screenshot: z.any(),
  expectedCode:z.number().optional()
})

const CardNumberSchema = z
  .union([z.string(), z.number()])
  .transform((val) => String(val).replace(/\s+/g, "")) // convert to string and strip spaces
  .refine((val) => /^\d+$/.test(val), {
    message: "Card number must contain only digits",
  })
  .refine((val) => val.length >= 13 && val.length <= 19, {
    message: "Card number must be between 13 and 19 digits",
  });

    const EventForm = z.object({
    title: z.string().optional(),
    guestName: z.string({message:"name is required"}),
    topics: z.array(z.string()).refine((val)=> val.length>0 , {message : "must have atleast one topic"}),

    isLinkedinVerified: z.boolean().optional().default(false),
    isXVerified: z.boolean().optional().default(false),
    isFacebookVerified: z.boolean().optional().default(false),
    isInstagramVerified: z.boolean().optional().default(false),
    isYoutubeVerified: z.boolean().optional().default(false),
    isTiktokVerified: z.boolean().optional().default(false),

    eventType : z.enum(["words", "time"]).default("words"),
    paymentMode : z.enum(["stripe", "paypal"]).optional().nullable(),
    wordsLength : z.number().optional().nullable(),
    timePeriod : z.number().optional().nullable(),
    isPaid : z.boolean().optional().default(false),
    offerAmount : z.number().optional().nullable(),

    cardHolder : z.number().optional().nullable(),
    cardExpireDate : z.number().optional().nullable(),
    cardNumber : z.union([z.number(),z.string()]).optional().nullable(),
  //   .refine((val) => val && /^\d+$/.test(val), {
  //   message: "Card number must contain only digits",
  // }),
    cardCVC : z.number().optional().nullable(),

}).superRefine((data, ctx) => {
  if (data.paymentMode === "stripe") {
    if (!data.cardHolder) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cardHolder"],
        message: "cardHolder is required when paymentMode is stripe",
      });
    }
    if (!data.cardExpireDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cardExpireDate"],
        message: "cardExpireDate is required when paymentMode is stripe",
      });
    }
    if (!data.cardNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cardNumber"],
        message: "cardNumber is required when paymentMode is stripe",
      });
    } else {
      const cardNumberResult = CardNumberSchema.safeParse(data.cardNumber);
      if (!cardNumberResult.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cardNumber"],
          message: cardNumberResult.error.issues[0].message,
        });
      }
    }
    if (!data.cardCVC) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cardCVC"],
        message: "cardCVC is required when paymentMode is stripe",
      });
    }
  }
})

// .superRefine((data, ctx) => {
//   if (data.paymentMode === "stripe") {
//     if (data.cardHolder == null) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         path: ["cardHolder"],
//         message: "cardHolder is required when paymentMode is stripe",
//       });
//     }
//     if (data.cardExpireDate == null) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         path: ["cardExpireDate"],
//         message: "cardExpireDate is required when paymentMode is stripe",
//       });
//     }
//     if (data.cardNumber == null) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         path: ["cardNumber"],
//         message: "cardNumber is required when paymentMode is stripe",
//       });
//     }
//     if (data.cardCVC == null) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         path: ["cardCVC"],
//         message: "cardCVC is required when paymentMode is stripe",
//       });
//     }
//   }
// })


type LoginFormProps = z.infer<typeof LoginSchema>;
type RegisterFormProps = z.infer<typeof RegisterSchema>;
type ProfileFormProps = z.infer<typeof ProfileSchema>;
type ChangePasswordFormProps = z.infer<typeof ChangePasswordSchema>;
type VerifySocialMediaProps = z.infer<typeof VerifySocialMedia>;
type EventFormProps = z.infer<typeof EventForm>;





export {
    LoginSchema,
    RegisterSchema,
    ProfileSchema,
    ChangePasswordSchema,
    VerifySocialMedia,
    EventForm
}
export type {
    
    LoginFormProps,
    RegisterFormProps,
    ProfileFormProps,
    ChangePasswordFormProps,
    VerifySocialMediaProps,
    EventFormProps
}



