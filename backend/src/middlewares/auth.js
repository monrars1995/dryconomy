import { supabase } from '../config/supabase.js';

export const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verifica o token JWT com o Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      console.error('Erro na autenticação:', error);
      return res.status(403).json({ error: 'Token inválido ou expirado' });
    }

    if (!user) {
      return res.status(403).json({ error: 'Usuário não encontrado' });
    }

    // Adiciona o usuário ao objeto de requisição para uso posterior
    req.user = user;
    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const checkRole = (roles = []) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    try {
      // Obtém o perfil do usuário para verificar a role
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', req.user.id)
        .single();

      if (error) throw error;

      if (!profile || !roles.includes(profile.role)) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      req.user.role = profile.role;
      next();
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      return res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
  };
};
