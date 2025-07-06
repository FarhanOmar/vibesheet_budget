import React, {
  FC,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ChangeEvent,
} from 'react'

type Template = {
  id: string
  name: string
  description: string
  thumbnailUrl: string
}

export interface TemplateGalleryProps {
  onSelect: (template: Template) => void
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  return debouncedValue
}

const TemplateGallery: FC<TemplateGalleryProps> = ({ onSelect }) => {
  const [templates, setTemplates] = useState<Template[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTemplates = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/templates', { signal })
      if (!response.ok) {
        throw new Error(`Error fetching templates: ${response.statusText}`)
      }
      const data: Template[] = await response.json()
      setTemplates(data)
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Unknown error')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchTemplates(controller.signal)
    return () => {
      controller.abort()
    }
  }, [fetchTemplates])

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const filteredTemplates = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return templates
    const term = debouncedSearchTerm.toLowerCase()
    return templates.filter(
      t =>
        t.name.toLowerCase().includes(term) ||
        t.description.toLowerCase().includes(term)
    )
  }, [debouncedSearchTerm, templates])

  if (loading) {
    return <div className="template-gallery__loading">Loading templates...</div>
  }

  if (error) {
    return (
      <div className="template-gallery__error">
        <p>Error: {error}</p>
        <button
          type="button"
          className="template-gallery__retry-button"
          onClick={() => fetchTemplates()}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="template-gallery">
      <div className="template-gallery__search">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search templates..."
          aria-label="Search templates"
        />
      </div>
      {filteredTemplates.length === 0 ? (
        <div className="template-gallery__empty">No templates found.</div>
      ) : (
        <div className="template-gallery__grid">
          {filteredTemplates.map(template => (
            <button
              key={template.id}
              type="button"
              className="template-gallery__card"
              onClick={() => onSelect(template)}
            >
              <div className="template-gallery__thumbnail">
                <img
                  src={template.thumbnailUrl}
                  alt={template.name}
                  loading="lazy"
                />
              </div>
              <div className="template-gallery__info">
                <h3 className="template-gallery__title">{template.name}</h3>
                <p className="template-gallery__description">
                  {template.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default TemplateGallery