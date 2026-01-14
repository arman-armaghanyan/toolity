import {Link, useLocation} from 'react-router-dom';
import '../../ComponentStyles/MainLayout.css';
import {useTools} from '../../../context/ToolsContext';
import {ImageComponent} from '../../Common/ImageComponent';

const getText = (field) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    if (typeof field === 'object' && field.text) return field.text;
    return '';
};

export function MiniToolsList() {
    const location = useLocation();
    const { tools, isLoading, error } = useTools();

    return (
        <main className="page-shell" id="mini-tools">
            <section className="hero">
                <span className="hero__eyebrow">Utilas</span>
                <h1 className="hero__title">Discover compact productivity helpers</h1>
                <p className="hero__subtitle">
                    A curated collection of in-browser utilities for design, collaboration, and content
                    work.
                </p>
            </section>

            {error && <div className="mini-grid__alert">{error}</div>}

            {isLoading && <div className="mini-grid__alert">Loading new tools…</div>}

            <section className="mini-grid">
                {tools && tools.map((tool) => (
                    <Link key={tool.id} to={`/app/${tool.id}`} state={{ from: location.pathname }} className="mini-card">
                        <div className="mini-card__visual">
                            <ImageComponent
                                src={tool.thumbnail}
                                alt=""
                                className="mini-card__thumb"
                                aria-hidden="true"
                            />
                        </div>
                        <div className="mini-card__content">
                            <h2 className="mini-card__title">{getText(tool.title)}</h2>
                            <p className="mini-card__summary">{getText(tool.summary)}</p>
                        </div>
                    </Link>
                ))}
            </section>
        </main>
    );
}
