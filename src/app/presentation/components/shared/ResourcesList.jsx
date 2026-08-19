"use client";

const SAFE_URL_PATTERN = /^(https?:|mailto:|#|\/)/;

const isSafeUrl = (url) =>
  typeof url === "string" && SAFE_URL_PATTERN.test(url);

const ResourcesList = ({ resources }) => {
  const items = Array.isArray(resources)
    ? resources.filter((resource) => resource && resource.title)
    : [];

  if (items.length === 0) return null;

  return (
    <div className="presentation-resources">
      <div className="presentation-resources-label">Resources</div>

      <ul className="presentation-resources-list">
        {items.map((resource) => (
          <li key={resource.id || resource.title}>
            {isSafeUrl(resource.src) ? (
              <a
                href={resource.src}
                target="_blank"
                rel="noopener noreferrer"
              >
                {resource.title}
              </a>
            ) : (
              resource.title
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ResourcesList;