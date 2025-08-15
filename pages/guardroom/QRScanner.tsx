import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../../services/api';
import { FullAccessApplication } from '../../types';

const QRScanner: React.FC = () => {
    const [scannedText, setScannedText] = useState<string>('');
    const [showModal, setShowModal] = useState<boolean>(false);
    const [modalMessage, setModalMessage] = useState<string>('');
    const [application, setApplication] = useState<FullAccessApplication | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const qrCodeScannerRef = useRef<Html5QrcodeScanner | null>(null);
    const modalTimerRef = useRef<NodeJS.Timeout | null>(null);

    const closeModal = () => {
        setShowModal(false);
        setApplication(null);
        setScannedText('');
        if (modalTimerRef.current) {
            clearTimeout(modalTimerRef.current);
            modalTimerRef.current = null;
        }
    };

    const handleScan = async (text: string) => {
        if (modalTimerRef.current) {
            clearTimeout(modalTimerRef.current);
        }

        setIsLoading(true);
        setShowModal(true);
        setModalMessage('');
        setApplication(null);

        try {
            const app = await api.getApplicationByQrid(text);
            if (app && app.qrid) {
                const isCheckedIn = app.checkInTime && !app.checkOutTime;
                const eventType = isCheckedIn ? 'check_out' : 'check_in';

                await api.addAccessLog(app.qrid, eventType);

                if (eventType === 'check_in') {
                    setModalMessage(`${app.applicant_name}님, 위드인천에너지에 오신 것을 환영합니다.`);
                } else {
                    setModalMessage('오늘 하루도 고생 많으셨습니다. 안녕히 가세요.');
                }
                setApplication(app);
            } else {
                setModalMessage('유효하지 않은 QR 코드입니다.');
            }
        } catch (error) {
            console.error('Error during scan and access log:', error);
            setModalMessage('처리 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
            modalTimerRef.current = setTimeout(() => {
                closeModal();
            }, 5000);
        }
    };

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                rememberLastUsedCamera: true
            },
            false // verbose
        );

        const onScanSuccess = (decodedText: string) => {
            if (decodedText !== scannedText) {
                setScannedText(decodedText);
                handleScan(decodedText);
            }
        };

        const onScanError = (errorMessage: string) => {
            // console.warn(`Code scan error = ${errorMessage}`);
        };

        scanner.render(onScanSuccess, onScanError);
        qrCodeScannerRef.current = scanner;

        return () => {
            if (modalTimerRef.current) {
                clearTimeout(modalTimerRef.current);
            }
            if (qrCodeScannerRef.current) {
                qrCodeScannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5QrcodeScanner", error);
                });
            }
        };
    }, [scannedText]); // Rerun useEffect if scannedText changes to avoid re-scanning same code

    const handleManualInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setScannedText(event.target.value);
    };

    const handleManualInputSubmit = () => {
        if (scannedText) {
            handleScan(scannedText);
        }
    };

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">QR 코드 스캔</h2>
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1">
                        <div id="reader" className="w-full h-auto border border-gray-300 rounded-lg overflow-hidden"></div>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div>
                            <label htmlFor="qr-text" className="block text-sm font-medium text-gray-700 mb-2">QR 텍스트 (수동 입력 또는 스캔 결과)</label>
                            <input
                                type="text"
                                id="qr-text"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-power-blue-500 focus:border-power-blue-500 sm:text-sm"
                                value={scannedText}
                                onChange={handleManualInputChange}
                                placeholder="QR 코드 텍스트가 여기에 표시됩니다."
                            />
                        </div>
                        <button
                            onClick={handleManualInputSubmit}
                            className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-power-blue-600 hover:bg-power-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-power-blue-500"
                        >
                            수동 입력 처리
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
                    <div className="relative p-8 bg-white w-full max-w-lg mx-auto rounded-xl shadow-2xl border max-h-[90vh] overflow-y-auto">
                        {isLoading ? (
                            <p>로딩 중...</p>
                        ) : (
                            <div>
                                <p className="text-lg">{modalMessage}</p>
                            </div>
                        )}
                        <div className="text-right mt-6">
                            <button
                                onClick={closeModal}
                                className="px-6 py-2 bg-power-blue-600 text-white rounded-lg hover:bg-power-blue-700 focus:outline-none focus:ring-2 focus:ring-power-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-md"
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default QRScanner;
