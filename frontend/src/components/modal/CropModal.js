import { animateModalOpen, animateModalClose, clearModalAnimations } from './ModalAnimation.js';

let croppie = null;
let resolveCrop = null;

export function openCropModal(imageSrc, options = {}) {
    return new Promise((resolve) => {
        resolveCrop = resolve;

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75';
        modal.id = 'crop-modal-overlay';

        modal.innerHTML = `
            <div class="crop-modal-content bg-white rounded-lg shadow-xl max-w-md md:max-w-lg lg:max-w-2xl w-full mx-2 sm:mx-4 overflow-hidden">
                <div class="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 class="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Crop Profile Photo</h3>
                    <button id="crop-modal-close" class="text-gray-400 hover:text-gray-600 transition">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>
                <div class="p-3 sm:p-4 md:p-6">
                    <p class="text-xs text-gray-500 mb-2 sm:mb-3 md:mb-4 text-center">Drag to adjust the crop area. The image will be cropped to a square.</p>
                    <div id="croppie-container" class="h-[250px] sm:h-[300px] md:h-[400px]"></div>
                </div>
                <div class="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 border-t border-gray-200 flex flex-row justify-end gap-2 sm:gap-3">
                    <button id="crop-modal-cancel" class="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition">
                        Cancel
                    </button>
                    <button id="crop-modal-confirm" class="px-3 sm:px-4 py-2 text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 rounded-md transition">
                        Crop & Save
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        const modalContent = modal.querySelector('.crop-modal-content');
        animateModalOpen(modal, modalContent, 'scale');

        const container = document.getElementById('croppie-container');
        const screenWidth = window.innerWidth;
        let viewportSize, boundarySize;
        
        if (screenWidth < 640) {
            viewportSize = 180;
            boundarySize = 250;
        } else if (screenWidth < 768) {
            viewportSize = 220;
            boundarySize = 300;
        } else {
            viewportSize = 300;
            boundarySize = 400;
        }
        
        croppie = new Croppie(container, {
            viewport: {
                width: viewportSize,
                height: viewportSize,
                type: 'square'
            },
            boundary: {
                width: boundarySize,
                height: boundarySize
            },
            showZoomer: true,
            enableZoom: true,
            minZoom: 0.5,
            enableResize: false,
            enableOrientation: true,
        });

        croppie.bind({
            url: imageSrc,
        });

        const closeBtn = document.getElementById('crop-modal-close');
        const cancelBtn = document.getElementById('crop-modal-cancel');
        const confirmBtn = document.getElementById('crop-modal-confirm');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', closeCropModal);
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeCropModal);
        }
        if (confirmBtn) {
            confirmBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                confirmCrop();
            });
        }
        
    });
}

async function closeCropModal() {
    const modal = document.getElementById('crop-modal-overlay');
    const modalContent = modal?.querySelector('.crop-modal-content');
    
    if (modal && modalContent) {
        await animateModalClose(modal, modalContent, 'scale');
    }
    
    if (croppie) {
        croppie.destroy();
        croppie = null;
    }
    
    if (modal) {
        modal.remove();
    }
    
    if (resolveCrop) {
        resolveCrop(null);
        resolveCrop = null;
    }
}

async function confirmCrop() {
    if (!croppie) {
        return;
    }

    try {
        const blob = await croppie.result({
            type: 'blob',
            size: 'viewport',
            format: 'jpeg',
            quality: 0.95,
        });
        
        if (resolveCrop && blob) {
            const file = new File([blob], 'cropped-profile-photo.jpg', { type: 'image/jpeg' });
            resolveCrop(file);
            resolveCrop = null;
        }
        
        await closeCropModal();
    } catch (error) {
        await closeCropModal();
    }
}

export function closeCropModalForce() {
    closeCropModal();
}
