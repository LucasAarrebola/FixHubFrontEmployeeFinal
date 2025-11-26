import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormCard from '../components/FormCard'
import Swal from 'sweetalert2'

// Import da imagem
import logo from '../assets/logo_fixhub.png'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!email || !senha) {
      Swal.fire('Erro', 'Preencha todos os campos!', 'error')
      return
    }

    try {
      const formData = new URLSearchParams()
      formData.append('email', email)
      formData.append('senha', senha)

      const response = await fetch('https://projeto-integrador-fixhub.onrender.com/api/fixhub/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      })

      if (!response.ok) {
        throw new Error(`Erro: ${response.status}`)
      }

      const data = await response.json()
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('username', data.nome)

      Swal.fire('Sucesso', 'Login realizado com sucesso!', 'success')
        .then(() => {
          navigate('/home')
        })
    } catch (error) {
      console.error('Erro no login:', error)
      Swal.fire('Erro', 'Falha ao fazer login. Verifique suas credenciais.', 'error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-6">
      <FormCard>
        <div className="text-center mb-4">
          <div className="flex items-center justify-center space-x-2">
            <img src={logo} className="w-12" alt="logo" />
            <span className="text-2xl font-bold text-[var(--primary)]">FixHub</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-2">
          <div>
            <label className="label">E-mail</label>
            <input
              className="input"
              placeholder="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Senha</label>
            <input
              className="input"
              placeholder="Senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />

            <div className="w-full flex justify-center mt-1">
              <div className="flex flex-col items-center space-y-2">
                <Link to="/forgot-password" className="text-sm text-[var(--primary)] text-center">
                  Esqueci minha senha
                </Link>

                <button type="submit" className="btn-primary px-4 py-1">
                  Login
                </button>
              </div>
            </div>
          </div>
        </form>
      </FormCard>
    </div>
  )
}
