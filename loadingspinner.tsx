import React from 'react';
import styled, { keyframes } from 'styled-components';

export interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  thickness?: number;
  className?: string;
}

const spinnerSpin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div<{ size: number }>`
  display: inline-block;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  position: relative;
`;

const Spinner = styled.div<{ size: number; color: string; thickness: number }>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border: ${props => props.thickness}px solid ${props => props.color}55;
  border-top: ${props => props.thickness}px solid ${props => props.color};
  border-radius: 50%;
  animation: ${spinnerSpin} 1s linear infinite;
`;

const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
`;

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  color = '#3498db',
  thickness = 4,
  className = '',
}) => (
  <SpinnerContainer
    role="status"
    aria-live="polite"
    className={className}
    size={size}
  >
    <Spinner size={size} color={color} thickness={thickness} />
    <VisuallyHidden>Loading...</VisuallyHidden>
  </SpinnerContainer>
);

export default LoadingSpinner;