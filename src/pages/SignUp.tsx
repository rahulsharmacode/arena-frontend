import ErrorLabel from '@/components/ErrorLabel';
import Navbar from '@/components/Navbar'; // Assuming you want the Navbar here too
import TransitionWrapper from '@/components/TransitionWrapper'; // Assuming you want consistent transitions
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { endpoint } from '@/services/api.services';
import { METHODS } from '@/services/interface.services';
import { RegisterFormProps, RegisterSchema } from '@/utils/interface/form.interface';
import { usePostData } from '@/utils/query/index.query';
import { zodResolver } from '@hookform/resolvers/zod';
import Cookies from 'js-cookie';
import { Eye, EyeClosed } from 'lucide-react';
import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner'; // Using toast for feedback consistency

// We don't need separate inline styles now as we use UI library components

const SignUp: React.FC = () => {
      const [isShow,setIsShow] = useState({
          password:false,
          confirmPassword:false
      })
    const navigate = useNavigate();
    const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormProps>({
    resolver : zodResolver(RegisterSchema),
    mode : "onChange"
  });


  
  /* mutation */
  const [searchParams] = useSearchParams();
  const {mutate,isPending} = usePostData();
  const loginUrl = searchParams.get("next") ? `/login?next=${searchParams.get("next")}`:"/login"
  /* submit */
  const onSubmit: SubmitHandler<RegisterFormProps> = (data) => {
    mutate({
      endpoint:endpoint["auth"]["register"],
      method:METHODS.POST,
      data : data
    },{
  onSuccess: (response) => {
  if ([200,201].includes(response.status)) {
    navigate(loginUrl);
    return toast.success("Registered successfully!");
  } else {
    return toast.error(response.response.data.message || "Failed to register");
  }
},
      onError: (data) => {
        // console.log("🚀 ~ data:", data);
        toast.error(data?.message||"Someting went wrong")
      }
    })
  }
  

  return (
    <>
      <Navbar />
      <TransitionWrapper animation="slide-up" className="min-h-screen pt-8 pb-10 px-4">
        <div className="max-w-sm sm:max-w-xs mx-auto pt-16">
          {/* Using Card structure similar to Login.tsx */}
          <Card className="border-0 shadow-subtle overflow-hidden p-2 sm:p-4">
            <CardHeader className="space-y-1 text-center p-2 pb-0">
              <CardTitle className="text-xl font-medium">Create an Account</CardTitle>
              <CardDescription>
                Join the Arena! Fill in your details below.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-3 p-2">

                {/* Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Your full name"
                    className="input-effect"
                    {...register("fullName")}
                  />
                  {errors.fullName && <ErrorLabel message={errors.fullName.message||""}  />}

                </div>

                {/* Username Input */}
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Choose a unique username"
                    className="input-effect"
                                        {...register("username")}

                  />
                  {errors.username && <ErrorLabel message={errors.username.message||""}  />}

                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="input-effect"
                                  {...register("email")}

                  />
                  {errors.email && <ErrorLabel message={errors.email.message||""}  />}

                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    placeholder="•••••••• (min. 5 characters)"
                    className="input-effect"
            type={isShow.password  ? "text" : "password"}

                                   {...register("password")}
              endIcon={isShow.password ? <Eye className="cursor-pointer" size={22} onClick={()=>setIsShow((prev)=>({...prev , password : false}))} /> : <EyeClosed className="cursor-pointer" size={22} onClick={()=>setIsShow((prev)=>({...prev , password : true}))} />}


                  />
                  {errors.password && <ErrorLabel message={errors.password.message||""}  />}

                </div>

                {/* Confirm Password Input */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                              type={isShow.confirmPassword  ? "text" : "password"}

                    placeholder="••••••••"
                    className="input-effect"
                                      {...register("confirm_password")}
              endIcon={isShow.confirmPassword ? <Eye className="cursor-pointer" size={22} onClick={()=>setIsShow((prev)=>({...prev , confirmPassword : false}))} /> : <EyeClosed className="cursor-pointer" size={22} onClick={()=>setIsShow((prev)=>({...prev , confirmPassword : true}))} />}


                  />
                  {errors.confirm_password && <ErrorLabel message={errors.confirm_password.message||""}  />}

                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-3 p-2 pt-0">
                <Button
                  type="submit"
                  className="w-full rounded-md button-effect"
                  disabled={isPending}
                >
                  {isPending ? 'Creating Account...' : 'Sign Up'}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link
                    to={loginUrl} // Link to Login page
                    className="text-primary underline-offset-4 transition-colors hover:underline"
                  >
                    Log in
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </TransitionWrapper>
    </>
  );
};

export default SignUp; 