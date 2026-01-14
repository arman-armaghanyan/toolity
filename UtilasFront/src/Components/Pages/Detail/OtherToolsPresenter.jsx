import { Link, useLocation } from 'react-router-dom';
import { ImageComponent } from '../../Common/ImageComponent';

export function OtherToolsPresenter({ otherTools }) {
    const location = useLocation();

    // Helper to extract text from rich content objects or plain strings
    const getText = (field) => {
        if (!field) return '';
        if (typeof field === 'string') return field;
        if (typeof field === 'object' && field.text) return field.text;
        return '';
    };

    return (
        <section className="other-tools">
            <h2 className="other-tools__title">Discover more tools</h2>
            <div className="other-tools__grid">
                {otherTools.map((otherTool) => (
                    <Link
                        key={otherTool.id}
                        to={`/app/${otherTool.id}`}
                        state={{ from: location.pathname }}
                        className="other-tool-card"
                    >
                        <div className="other-tool-card__body">
                            <ImageComponent
                                src={otherTool.thumbnail}
                                alt=""
                                className="other-tool-card__thumb"
                                aria-hidden="true"
                            />
                            <div className="other-tool-card__content">
                                <h3 className="other-tool-card__title">
                                    {getText(otherTool.title)}
                                </h3>
                                <p className="other-tool-card__summary">
                                    {getText(otherTool.summary)}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
