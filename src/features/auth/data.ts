'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/features/auth/api';
import type { LoginCredentials, RegistrationCredentials, ProfileUpdate } from '@/features/auth/types';

export const authKeys = {
  currentUser: ['auth', 'current-user'],
};

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.currentUser,
    queryFn: ({ signal }) => authApi.me(signal),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (response) => {
      queryClient.clear();
      queryClient.setQueryData(authKeys.currentUser, response);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: RegistrationCredentials) => authApi.register(credentials),
    onSuccess: (response) => {
      queryClient.clear();
      queryClient.setQueryData(authKeys.currentUser, response);
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (changes: ProfileUpdate) => authApi.updateProfile(changes),
    onSuccess: (response) => queryClient.setQueryData(authKeys.currentUser, response),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => queryClient.clear(),
  });
}
