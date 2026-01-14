import {Link, useNavigate, useParams, useLocation} from 'react-router-dom';
import {useEffect, useState, useRef, useCallback, useMemo} from 'react';
import {useSearch} from '../../../context/SearchContext';
import {useTools} from '../../../context/ToolsContext';
import {Footer} from '../Main/Footer';
import {OtherToolsPresenter} from './OtherToolsPresenter';
import '../../ComponentStyles/DetailPage.css';
import {API_URL, BASE_API_URL} from '../../../config';
import {useQuery} from "@tanstack/react-query";
import {ImageComponent} from '../../Common/ImageComponent';

export function MiniToolDetail() {
    const {appId} = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [isScrolledToInfo, setIsScrolledToInfo] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isIframeLoading, setIsIframeLoading] = useState(true);

    const infoSectionRef = useRef(null);
    const toolSectionRef = useRef(null);
    const scrollThresholdTriggered = useRef(false);

    const { openGlobalSearch, isGlobalSearchOpen } = useSearch();

    // Close menu handler
    const closeMenu = useCallback(() => {
        setIsMenuOpen(false);
    }, []);

    // Lock body scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);

    const {isLoading:isToolLoading , data:tool, error} = useQuery({
        queryKey: ['tool' + appId],
        queryFn: () => {
            return  fetch(`${BASE_API_URL}/${API_URL}/${appId}`)
                .then((res) => res.json())
        }})

    const { tools: allTools, isLoading: isToolsLoading } = useTools();

    // Get random other tools (4-6 tools excluding current)
    const otherTools = useMemo(() => {
        if (!allTools || !allTools.length || !tool) return [];
        
        const filtered = allTools.filter(t => t.id !== appId);
        const shuffled = [...filtered].sort(() => Math.random() - 0.5);
        const count = Math.min(Math.floor(Math.random() * 3) + 4, shuffled.length); // 4-6 tools
        return shuffled.slice(0, count);
    }, [allTools, appId, tool]);

    // Smart ESC/Back navigation logic
    const handleBackNavigation = useCallback(() => {
        const previousPath = location.state?.from;

        if (previousPath) {
            if (previousPath === '/' || previousPath === '/home') {
                navigate('/');
            } else {
                navigate('/');
            }
        } else {
            navigate('/');
        }
    }, [navigate, location.state]);

    // ESC key handler - close menu first, then navigate if search modal is not open
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                // If menu is open, close it first
                if (isMenuOpen) {
                    closeMenu();
                    return;
                }
                // Only navigate if search modal is not open
                if (!isGlobalSearchOpen) {
                    handleBackNavigation();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleBackNavigation, isGlobalSearchOpen, isMenuOpen, closeMenu]);

    // Scroll to info section
    const scrollToInfo = useCallback(() => {
        if (infoSectionRef.current) {
            infoSectionRef.current.scrollIntoView({ behavior: 'smooth' });
            setIsScrolledToInfo(true);
        }
    }, []);


    // Threshold scroll detection
    useEffect(() => {
        let ticking = false;
        
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrollY = window.scrollY;
                    const threshold = 50;
                    
                    // Only trigger once when crossing threshold downward
                    if (scrollY > threshold && !scrollThresholdTriggered.current && !isScrolledToInfo) {
                        scrollThresholdTriggered.current = true;
                        scrollToInfo();
                    }
                    
                    // Reset when scrolled back to top
                    if (scrollY < 10) {
                        scrollThresholdTriggered.current = false;
                        setIsScrolledToInfo(false);
                    }
                    
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [scrollToInfo, isScrolledToInfo]);

    // Reset scroll state when tool changes
    useEffect(() => {
        window.scrollTo(0, 0);
        setIsScrolledToInfo(false);
        scrollThresholdTriggered.current = false;
    }, [appId]);

    // Helper to extract text from rich content objects or plain strings
    const getText = (field) => {
        if (!field) return '';
        if (typeof field === 'string') return field;
        if (typeof field === 'object' && field.text) return field.text;
        return '';
    };


    // Key Feature card component
    const KeyFeatureCard = ({ feature }) => {
        return (
            <div className="key-feature-card">
                {feature.image && (
                    <ImageComponent
                        src={feature.image}
                        alt=""
                        className="key-feature-card__icon"
                    />
                )}
                <h3 className="key-feature-card__title">{feature.title}</h3>
                <p className="key-feature-card__description">{feature.description}</p>
            </div>
        );
    };

    // Description block component for image + text with orientation
    const DescriptionBlock = ({ block, index }) => {
        const orientation = block.orientation || 'left';
        const hasButton = block.buttonLink && block.buttonLink.trim() !== '';
        
        return (
            <div
                key={index}
                className={`description-block description-block--${orientation}`}
            >
                <ImageComponent
                    src={block.image}
                    alt=""
                    className="description-block__image"
                />
                <div className="description-block__content">
                    {block.title && (
                        <h3 className="description-block__headline">{block.title}</h3>
                    )}
                    <p className="description-block__text">{block.text}</p>
                    {hasButton && (
                        <a 
                            href={block.buttonLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="description-block__button"
                        >
                            Learn More
                            <svg 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            >
                                <path d="M7 17L17 7"/>
                                <path d="M7 7h10v10"/>
                            </svg>
                        </a>
                    )}
                </div>
            </div>
        );
    };

    if (isToolLoading) {
        return (
            <section className="detail-shell__empty">
                <h2>Loading…</h2>
                <p>We are fetching the latest information about this tool.</p>
            </section>
        );
    }

    if (!tool) {
        return (
            <section className="detail-shell__empty">
                <h2>Tool not found</h2>
                <p>The mini app you are trying to open may have moved or been removed.</p>
                {error ? <p>{error}</p> : null}
                <Link to="/" className="detail-shell__home">
                    Return home
                </Link>
            </section>
        );
    }

    return (
        <div className="detail-page">
            {/* Full-screen tool section */}
            <section className="tool-viewport" ref={toolSectionRef}>
                {/* Custom tool header */}
                <header className={`tool-header ${isMenuOpen ? 'tool-header--menu-open' : ''}`}>
                    {/* Backdrop overlay - click to close */}
                    <div 
                        className={`tool-header__backdrop ${isMenuOpen ? 'tool-header__backdrop--visible' : ''}`}
                        onClick={closeMenu}
                        aria-hidden="true"
                    />
                    {/* Back button - top left */}
                    <button 
                        className="tool-header__back"
                        onClick={handleBackNavigation}
                        aria-label="Go back"
                    >
                        <svg 
                            width="20" 
                            height="20" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <path d="m15 18-6-6 6-6"/>
                        </svg>
                        <span>Back</span>
                    </button>

                    {/* Logo - center */}
                    <Link to="/" className="tool-header__logo">
                        Utilas
                    </Link>

                    {/* Burger menu button */}
                    <button 
                        className="tool-header__burger"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                        aria-expanded={isMenuOpen}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>

                    {/* Menu items - right */}
                    <nav className={`tool-header__nav ${isMenuOpen ? 'tool-header__nav--open' : ''}`}>
                        {/* Close button */}
                        <button 
                            className="tool-header__close"
                            onClick={closeMenu}
                            aria-label="Close menu"
                        >
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
                                <path d="M18 6 6 18"/>
                                <path d="m6 6 12 12"/>
                            </svg>
                        </button>
                        
                        <button 
                            className="tool-header__nav-item tool-header__nav-item--text tool-header__nav-item--search"
                            onClick={() => {
                                openGlobalSearch();
                                closeMenu();
                            }}
                            aria-label="Search"
                        >
                            <span>Search</span>
                            <kbd className="tool-header__hotkey">
                                {navigator.platform.indexOf('Mac') > -1 ? '⌘' : 'Ctrl+'}K
                            </kbd>
                        </button>
                    </nav>
                </header>

                {/* Full-screen iframe with padding */}
                <div className="tool-iframe-container">
                    {isIframeLoading && (
                        <div className="iframe-loading-overlay">
                            <div className="iframe-loading-spinner">
                                <div className="spinner"></div>
                                <p>Loading tool...</p>
                            </div>
                        </div>
                    )}
                    <iframe
                        className="tool-iframe"
                        src={tool.iframeUrl}
                        title={getText(tool.title)}
                        allow="clipboard-write; fullscreen; accelerometer; gyroscope"
                        onLoad={() => setIsIframeLoading(false)}
                    />
                </div>

                {/* Bottom bar */}
                <div className="tool-bottombar">
                    {/* Tool info - name and description */}
                    <div className="tool-info">
                        <h1 className="tool-info__title">{getText(tool.title)}</h1>
                        <p className="tool-info__description">{getText(tool.summary)}</p>
                    </div>

                    {/* View similar tools button */}
                    <button 
                        className="view-similar-btn"
                        onClick={scrollToInfo}
                        aria-label="View similar tools"
                    >
                        <span>View similar tools</span>
                        <svg 
                            width="18" 
                            height="18" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <path d="m6 9 6 6 6-6"/>
                        </svg>
                    </button>
                </div>
            </section>

            {/* Info and discovery section */}
            <section className="info-section" ref={infoSectionRef}>
                {/* Mobile tool info header - shown on tablet/mobile only */}
                <header className="tool-info-mobile">
                    <h1 className="tool-info-mobile__title">{getText(tool.title)}</h1>
                    <p className="tool-info-mobile__description">{getText(tool.summary)}</p>
                </header>

                {/* About this tool */}
                <article className="about-tool">
                    {/* Key Features Section */}
                    {tool && Array.isArray(tool.keyFeatures) && tool.keyFeatures.length > 0 && (
                        <div className="key-features-section">
                            <div className="key-features-grid">
                                {tool.keyFeatures.map((feature, index) => (
                                    <KeyFeatureCard key={feature.id || index} feature={feature} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Description Blocks */}
                    {tool && Array.isArray(tool.description) && tool.description.length > 0 ? (
                        <div className="description-blocks">
                            {tool.description.map((block, index) => (
                                <DescriptionBlock key={block.id || index} block={block} index={index} />
                            ))}
                        </div>
                    ) : null}

                    {/* Other tools section - At the end of descriptions */}
                    {!isToolsLoading && otherTools && otherTools.length > 0 && (
                        <OtherToolsPresenter otherTools={otherTools} />
                    )}
                </article>

                {/* Footer */}
                <Footer />
            </section>
        </div>
    );
}
