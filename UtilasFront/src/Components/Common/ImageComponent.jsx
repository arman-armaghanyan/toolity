import { useState, useEffect, useRef } from 'react';
import { BASE_API_URL } from '../../config';
import '../ComponentStyles/ImageComponent.css';

export function ImageComponent({ 
    src, 
    alt = '', 
    className = '', 
    placeholder = null,
    onLoad,
    onError,
    lazy = true,
    ...restProps
}) {
    const [imageState, setImageState] = useState(lazy ? 'waiting' : 'loading'); // 'waiting', 'loading', 'loaded', 'error'
    const [imageUrl, setImageUrl] = useState(null);
    const [shouldLoad, setShouldLoad] = useState(!lazy); // Start loading immediately if not lazy
    const containerRef = useRef(null);

    // Intersection Observer for lazy loading
    useEffect(() => {
        // If lazy loading is disabled, load immediately
        if (!lazy) {
            setShouldLoad(true);
            setImageState('loading');
            return;
        }

        // If shouldLoad is already true, skip observer setup
        if (shouldLoad) {
            return;
        }

        // If Intersection Observer is not supported, fallback to immediate loading
        if (!('IntersectionObserver' in window)) {
            setShouldLoad(true);
            setImageState('loading');
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setShouldLoad(true);
                        setImageState('loading'); // Switch from waiting to loading
                        observer.disconnect();
                    }
                });
            },
            {
                rootMargin: '50px', // Start loading 50px before the image enters viewport
                threshold: 0.01
            }
        );

        const currentRef = containerRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        // Cleanup observer on unmount
        return () => {
            if (currentRef) {
                observer.disconnect();
            }
        };
    }, [lazy, shouldLoad]);

    // Load image when shouldLoad becomes true
    useEffect(() => {
        if (!shouldLoad) {
            return;
        }

        if (!src) {
            setImageState('error');
            setImageUrl(null);
            return;
        }

        // Reset state when src changes or when shouldLoad becomes true
        setImageState('loading');
        setImageUrl(null);

        // Construct the API URL
        const apiUrl = `${src}`;
        console.log(apiUrl);
        // Create a new Image object to preload
        const img = new Image();
        
        img.onload = () => {
            setImageUrl(apiUrl);
            setImageState('loaded');
            if (onLoad) onLoad();
        };

        img.onerror = () => {
            setImageState('error');
            if (onError) onError();
        };

        // Start loading the image
        img.src = apiUrl;

        // Cleanup function
        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [shouldLoad, src, onLoad, onError]);

    // Render waiting state (lazy loading - not in viewport yet)
    if (imageState === 'waiting') {
        return (
            <div 
                ref={containerRef}
                className={`image-component image-component--waiting ${className}`} 
                {...restProps}
            >
                <div className="image-component__placeholder">
                    <svg 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    >
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                    </svg>
                </div>
            </div>
        );
    }

    // Render loading state (actually loading from backend)
    if (imageState === 'loading') {
        return (
            <div 
                ref={containerRef}
                className={`image-component image-component--loading ${className}`} 
                {...restProps}
            >
                <div className="image-component__spinner"></div>
            </div>
        );
    }

    // Render error state with placeholder
    if (imageState === 'error') {
        if (placeholder) {
            return (
                <img 
                    ref={containerRef}
                    src={placeholder} 
                    alt={alt} 
                    className={`image-component image-component--error ${className}`}
                    {...restProps}
                />
            );
        }
        return (
            <div 
                ref={containerRef}
                className={`image-component image-component--error ${className}`} 
                {...restProps}
            >
                <div className="image-component__placeholder">
                    <svg 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    >
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                    </svg>
                </div>
            </div>
        );
    }

    // Render loaded image
    return (
        <img 
            ref={containerRef}
            src={imageUrl} 
            alt={alt} 
            className={`image-component image-component--loaded ${className}`}
            onLoad={() => {
                if (onLoad) onLoad();
            }}
            onError={() => {
                setImageState('error');
                if (onError) onError();
            }}
            {...restProps}
        />
    );
}

