import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  submitStudentProfile,
  uploadStudentPhoto,
  getStudentPhotos,
  updateStudentStatus,
} from '../api/student.service';

export const useStudentPhotosQuery = (studentId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['student-photos', studentId],
    queryFn: () => getStudentPhotos(studentId),
    enabled: !!studentId && enabled,
  });
};

export const useSubmitStudentProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => submitStudentProfile(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['session'] });
    },
    throwOnError: false,
  });
};

export const useUploadStudentPhotoMutation = () => {
  return useMutation({
    mutationFn: ({
      studentId,
      documentType,
      file,
    }: {
      studentId: number;
      documentType: string;
      file: File;
    }) => uploadStudentPhoto(studentId, documentType, file),
    throwOnError: false,
  });
};

export const useUpdateStudentStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: string) => updateStudentStatus(status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['session'] });
    },
    throwOnError: false,
  });
};
