import React from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/button';

interface NavigationAlertProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const NavigationAlert: React.FC<NavigationAlertProps> = ({ isOpen, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-card-bg rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-700 transform transition-all scale-100">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Unsaved Changes
                </h3>

                <Alert variant="danger" className="mb-6">
                    You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
                </Alert>

                <div className="flex justify-end gap-3">
                    <Button
                        variant="secondary"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onConfirm}
                    >
                        Leave without Saving
                    </Button>
                </div>
            </div>
        </div>
    );
};
