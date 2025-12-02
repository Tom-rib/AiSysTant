import { Router } from 'express';
import { SSHController } from '../controllers/SSHController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

/**
 * @route   POST /api/ssh/servers
 * @desc    Créer un nouveau serveur SSH
 * @access  Private
 */
router.post('/servers', SSHController.createServer);

/**
 * @route   GET /api/ssh/servers
 * @desc    Obtenir tous les serveurs SSH de l'utilisateur
 * @access  Private
 */
router.get('/servers', SSHController.getServers);

/**
 * @route   GET /api/ssh/servers/:id
 * @desc    Obtenir un serveur SSH spécifique
 * @access  Private
 */
router.get('/servers/:id', SSHController.getServer);

/**
 * @route   PUT /api/ssh/servers/:id
 * @desc    Mettre à jour un serveur SSH
 * @access  Private
 */
router.put('/servers/:id', SSHController.updateServer);

/**
 * @route   DELETE /api/ssh/servers/:id
 * @desc    Supprimer un serveur SSH
 * @access  Private
 */
router.delete('/servers/:id', SSHController.deleteServer);

/**
 * @route   POST /api/ssh/servers/:id/connect
 * @desc    Se connecter à un serveur SSH
 * @access  Private
 */
router.post('/servers/:id/connect', SSHController.connect);

/**
 * @route   POST /api/ssh/servers/:id/disconnect
 * @desc    Se déconnecter d'un serveur SSH
 * @access  Private
 */
router.post('/servers/:id/disconnect', SSHController.disconnect);

/**
 * @route   POST /api/ssh/servers/:id/execute
 * @desc    Exécuter une commande sur un serveur SSH
 * @access  Private
 */
router.post('/servers/:id/execute', SSHController.executeCommand);

/**
 * @route   GET /api/ssh/servers/:id/system-info
 * @desc    Obtenir les informations système d'un serveur
 * @access  Private
 */
router.get('/servers/:id/system-info', SSHController.getSystemInfo);

/**
 * @route   GET /api/ssh/history
 * @desc    Obtenir l'historique des commandes
 * @access  Private
 */
router.get('/history', SSHController.getCommandHistory);

/**
 * @route   POST /api/ssh/test-connection
 * @desc    Tester une connexion SSH sans sauvegarder
 * @access  Private
 */
router.post('/test-connection', SSHController.testConnection);

/**
 * @route   POST /api/ssh/servers/:id/read-file
 * @desc    Lire le contenu d'un fichier
 * @access  Private
 */
router.post('/servers/:id/read-file', SSHController.readFile);

/**
 * @route   POST /api/ssh/servers/:id/write-file
 * @desc    Créer ou modifier un fichier
 * @access  Private
 */
router.post('/servers/:id/write-file', SSHController.writeFile);

/**
 * @route   POST /api/ssh/servers/:id/install-package
 * @desc    Installer un paquet
 * @access  Private
 */
router.post('/servers/:id/install-package', SSHController.installPackage);

export default router;
