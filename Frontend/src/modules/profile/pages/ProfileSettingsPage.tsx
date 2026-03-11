import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { roleLabels } from '@/app/navigation'
import { useAuth } from '@/context/AuthContext'

function splitName(fullName: string) {
  const pieces = fullName.trim().split(/\s+/).filter(Boolean)
  const firstName = pieces.slice(0, 1).join(' ')
  const lastName = pieces.slice(1).join(' ')
  return { firstName, lastName }
}

export function ProfileSettingsPage() {
  const { updateProfile, user } = useAuth()
  const navigate = useNavigate()

  const { firstName: initialFirstName, lastName: initialLastName } = splitName(user?.fullName ?? '')

  const [firstName, setFirstName] = useState(initialFirstName)
  const [lastName, setLastName] = useState(initialLastName)
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [birthDate, setBirthDate] = useState('')
  const [gender, setGender] = useState('')
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [submitMessage, setSubmitMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const previewUrl = useMemo(() => {
    if (!profileImage) {
      return null
    }
    return URL.createObjectURL(profileImage)
  }, [profileImage])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) {
      return
    }
    setProfileImage(selectedFile)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitMessage('')
    setErrorMessage('')
    setIsSaving(true)

    updateProfile({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
    })
      .then(() => setSubmitMessage('Perfil actualizado correctamente.'))
      .catch((error) =>
        setErrorMessage(error instanceof Error ? error.message : 'No fue posible actualizar el perfil.'),
      )
      .finally(() => setIsSaving(false))
  }

  return (
    <section className="profile-screen">
      <p className="profile-breadcrumb">Home - Mi perfil</p>

      <div className="profile-shell">
        <header className="profile-brand-center">
          <img alt="SIM LogicFlow" className="profile-brand-logo" src="/logoSIMLogic.png" />
        </header>

        <div className="profile-avatar-zone">
          <div className="profile-avatar-frame">
            {previewUrl ? (
              <img alt="Vista previa de perfil" className="profile-avatar-image" src={previewUrl} />
            ) : (
              <div className="profile-avatar-fallback">
                <span className="profile-avatar-head" />
                <span className="profile-avatar-body" />
              </div>
            )}
          </div>
        </div>

        <form className="profile-form-card" onSubmit={handleSubmit}>
          <div className="profile-form-group">
            <label>1. Nombre completo</label>
            <div className="profile-two-cols">
              <input
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="Nombre"
                type="text"
                value={firstName}
              />
              <input
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Apellido"
                type="text"
                value={lastName}
              />
            </div>
          </div>

          <div className="profile-form-group">
            <label>2. Correo electronico</label>
            <input
              onChange={(event) => setEmail(event.target.value)}
              placeholder="usuario@cea.gov.co"
              type="email"
              value={email}
            />
          </div>

          <div className="profile-form-group">
            <label>3. Numero de telefono</label>
            <input
              onChange={(event) => setPhone(event.target.value)}
              placeholder="3000000000"
              type="tel"
              value={phone}
            />
          </div>

          <div className="profile-form-group">
            <label>4. Fecha de nacimiento</label>
            <input
              onChange={(event) => setBirthDate(event.target.value)}
              type="date"
              value={birthDate}
            />
          </div>

          <div className="profile-form-group">
            <label>5. Genero</label>
            <select onChange={(event) => setGender(event.target.value)} value={gender}>
              <option value="">Por favor seleccione</option>
              <option value="femenino">Femenino</option>
              <option value="masculino">Masculino</option>
              <option value="otro">Otro</option>
              <option value="prefiero_no_decirlo">Prefiero no decirlo</option>
            </select>
          </div>

          <div className="profile-form-group">
            <label>6. Imagen de perfil</label>
            <input accept="image/*" onChange={handleImageChange} type="file" />
          </div>

          <div className="profile-role-line">
            Rol actual: <strong>{user ? roleLabels[user.role] : '-'}</strong>
          </div>

          <div className="profile-form-actions">
            <button className="button button-muted" onClick={() => navigate('/')} type="button">
              Volver
            </button>
            <button className="button button-primary" disabled={isSaving} type="submit">
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
          {submitMessage ? <p className="status-ok">{submitMessage}</p> : null}
          {errorMessage ? <p className="status-alert">{errorMessage}</p> : null}
        </form>
      </div>
    </section>
  )
}
