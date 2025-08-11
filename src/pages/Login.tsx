
import ErrorLabel from '@/components/ErrorLabel';
import Navbar from '@/components/Navbar';
import TransitionWrapper from '@/components/TransitionWrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { endpoint } from '@/services/api.services';
import { METHODS } from '@/services/interface.services';
import { LoginFormProps, LoginSchema } from '@/utils/interface/form.interface';
import { usePostData } from '@/utils/query/index.query';
import { zodResolver } from '@hookform/resolvers/zod';
import Cookies from 'js-cookie';
import { Eye, EyeClosed } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isShow,setIsShow] = useState<boolean>(false);
  const [searchParams] = useSearchParams();

    const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormProps>({
    resolver : zodResolver(LoginSchema),
    mode : "onChange"
  });


  /* route protcation */
  useEffect(()=>{
    if(Cookies.get('access')) navigate('/home')
  }, [])
  /* mutation */
  const redirectUrl =  searchParams.get("next") ? `/invite/${searchParams.get("next")}` :
  "/home"
  const {mutate,isPending} = usePostData()
  /* submit */
  const onSubmit: SubmitHandler<LoginFormProps> = (data) => {
    mutate({
      endpoint:endpoint["auth"]["login"],
      method:METHODS.POST,
      data : data
    },{
      onSuccess: ({status,data}) => {
        if([200,201].includes(status)){
          Cookies.set("access",data.token);
          Cookies.set("uid",data.data._id);
          Cookies.set("username",data.data.username);
          Cookies.set("email",data.data.email);
          Cookies.set("profileImage",data.data.image);
          Cookies.set("fullName", data?.data?.fullName);
          navigate(redirectUrl||"");
          return toast.success('Login successfully!');
        }
        else{
          return toast.error('Login failed!');
        }
      },
      onError : (data) =>{
        return toast.error(data?.message||"Something went wrong!");
      }
    })
  }
  



  return (
    <>
      <Navbar />
      <TransitionWrapper animation="slide-up" className="min-h-screen pt-20 pb-10 px-4">
        <div className="max-w-md mx-auto pt-10">
          <Card className="border-0 shadow-subtle overflow-hidden">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-medium">Welcome back</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="input-effect"
                    {...register("email")}
                  />
                  {errors.email && <ErrorLabel message={errors.email.message||""}  />}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    {...register("password")}
                    type={isShow?'text':'password'}
                    placeholder="Enter your password"
                    className="input-effect"
                    endIcon={isShow ? <Eye className="cursor-pointer" size={24} onClick={()=>setIsShow(()=>(false))} /> : <EyeClosed className="cursor-pointer" size={24} onClick={()=>setIsShow(()=>(true))} />}
                  />
                  {errors.password && <ErrorLabel message={errors.password.message||""}  />}
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full rounded-md button-effect"
                  disabled={isPending}

                >
                {isPending ? "Processing..."  : "Sign in"}
                </Button>
                
                <div className="text-center text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link
                    to={searchParams.get("next") ? `/register?next=${searchParams.get("next")}`:"/register"}
                    className="text-primary underline-offset-4 transition-colors hover:underline"
                  >
                    Sign up
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

export default Login;
