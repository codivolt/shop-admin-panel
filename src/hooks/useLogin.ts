import { useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch } from './useRedux';
import { loginSuccess } from '../store/authSlice';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  phone: z.string().min(11, 'شماره موبایل نامعتبر است'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function useLogin(onSuccess?: () => void) {
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: async (credentials: LoginFormData) => {
      const res = await api.post('/auth/login', credentials);
      return res.data;
    },
    onSuccess: (data) => {
      dispatch(loginSuccess({ token: data.access_token, user: data.user }));
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onSuccess?.();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'شماره موبایل یا رمز عبور اشتباه است');
    },
  });

  const isLoading = mutation.isPending;

  const onSubmit = (data: LoginFormData) => {
    mutation.mutate(data);
  };

  return {
    register,
    handleSubmit,
    errors,
    isLoading,
    onSubmit,
  };
}
