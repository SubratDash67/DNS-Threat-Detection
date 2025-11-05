import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Paper } from '@mui/material';
import { Upload, File } from 'lucide-react';

interface FileDropZoneProps {
  onFileDrop: (file: File) => void;
  acceptedFileTypes?: string[];
  maxSize?: number; // in bytes
  disabled?: boolean;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({
  onFileDrop,
  acceptedFileTypes = ['.csv', '.txt'],
  maxSize = 10 * 1024 * 1024, // 10MB default
  disabled = false,
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileDrop(acceptedFiles[0]);
      }
    },
    [onFileDrop]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    multiple: false,
    disabled,
  });

  return (
    <Box>
      <Paper
        {...getRootProps()}
        elevation={isDragActive ? 8 : 2}
        sx={{
          p: 4,
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'rgba(255, 255, 255, 0.2)',
          backgroundColor: isDragActive ? 'rgba(0, 255, 255, 0.05)' : 'background.paper',
          transition: 'all 0.3s ease',
          opacity: disabled ? 0.5 : 1,
          '&:hover': {
            borderColor: disabled ? 'rgba(255, 255, 255, 0.2)' : 'primary.main',
            backgroundColor: disabled ? 'background.paper' : 'rgba(0, 255, 255, 0.05)',
          },
        }}
      >
        <input {...getInputProps()} />
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          {isDragActive ? (
            <>
              <Upload size={48} color="#00FFFF" />
              <Typography variant="h6" color="primary">
                Drop your file here
              </Typography>
            </>
          ) : (
            <>
              <File size={48} color="#B0BEC5" />
              <Typography variant="h6">
                Drag & drop a file here, or click to select
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supported formats: {acceptedFileTypes.join(', ')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Max size: {(maxSize / 1024 / 1024).toFixed(0)}MB
              </Typography>
            </>
          )}
        </Box>
      </Paper>

      {fileRejections.length > 0 && (
        <Typography variant="body2" color="error" sx={{ mt: 2 }}>
          {fileRejections[0].errors[0].message}
        </Typography>
      )}
    </Box>
  );
};

export default FileDropZone;
