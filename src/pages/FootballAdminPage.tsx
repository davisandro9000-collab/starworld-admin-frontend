// admin/src/pages/FootballAdminPage.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/axios';
import { Button } from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { PageHeader, EmptyState } from '../components/ui/adminHelpers';
import { useAdminNotifStore } from '../stores/adminNotifStore';

interface FootballTeam {
  id: string;
  name: string;
  slug: string;
  group: string;
  flagUrl: string;
  coach: string;
  description: string;
}

interface FootballPlayer {
  id: string;
  teamId: string;
  name: string;
  position: string;
  number: number;
  goals: number;
  assists: number;
  imageUrl: string;
}

interface FootballMatch {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam?: { name: string };
  awayTeam?: { name: string };
  matchDate: string;
  venue: string;
  tournament: string;
  status: string;
  ticketUrl: string;
  homeScore?: number;
  awayScore?: number;
}

// Type for match form data (all strings because inputs)
type MatchFormData = {
  homeTeamId: string;
  awayTeamId: string;
  matchDate: string;
  venue: string;
  tournament: string;
  ticketUrl: string;
  homeScore: string;
  awayScore: string;
  status: string;
};

// Type for the API payload (numbers for scores)
type MatchPayload = {
  homeTeamId: string;
  awayTeamId: string;
  matchDate: string;
  venue: string;
  tournament: string;
  ticketUrl: string;
  status: string;
  homeScore?: number | null;
  awayScore?: number | null;
};

export default function FootballAdminPage() {
  const { push } = useAdminNotifStore();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'teams' | 'players' | 'matches'>('matches');

  // Team modal
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<FootballTeam | null>(null);
  const [teamForm, setTeamForm] = useState({
    name: '', slug: '', group: '', flagUrl: '', coach: '', description: '',
  });

  // Player modal
  const [playerModalOpen, setPlayerModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<FootballPlayer | null>(null);
  const [playerForm, setPlayerForm] = useState({
    teamId: '', name: '', position: '', number: 0, goals: 0, assists: 0, imageUrl: '',
  });

  // Match modal
  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<FootballMatch | null>(null);
  const [matchForm, setMatchForm] = useState<MatchFormData>({
    homeTeamId: '',
    awayTeamId: '',
    matchDate: '',
    venue: '',
    tournament: '',
    ticketUrl: '',
    homeScore: '',
    awayScore: '',
    status: 'upcoming',
  });

  // Prediction modal
  const [predictionModalOpen, setPredictionModalOpen] = useState(false);
  const [selectedMatchForPrediction, setSelectedMatchForPrediction] = useState<FootballMatch | null>(null);
  const [predictionForm, setPredictionForm] = useState({
    name: '',
    description: '',
    predictionType: 'WINNER',
    points: 10,
    coinReward: 5,
    startsAt: '',
    endsAt: '',
  });

  // Ticket modal
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [selectedMatchForTicket, setSelectedMatchForTicket] = useState<FootballMatch | null>(null);
  const [ticketForm, setTicketForm] = useState({
    priceCoins: 100,
    seatInfo: '',
    expiresAt: '',
  });

  // ----- Queries -----
  const { data: teams, isLoading: teamsLoading } = useQuery<FootballTeam[]>({
    queryKey: ['admin-football-teams'],
    queryFn: () => adminApi.get('/football/teams').then(r => r.data.teams),
  });

  const { data: players, isLoading: playersLoading } = useQuery<FootballPlayer[]>({
    queryKey: ['admin-football-players'],
    queryFn: () => adminApi.get('/football/players').then(r => r.data.players),
  });

  const { data: matches, isLoading: matchesLoading } = useQuery<FootballMatch[]>({
    queryKey: ['admin-football-matches'],
    queryFn: () => adminApi.get('/football/matches').then(r => r.data.matches),
  });

  // ----- Mutations -----
  const createTeam = useMutation({
    mutationFn: (data: typeof teamForm) => adminApi.post('/football/teams', data),
    onSuccess: () => {
      push({ title: 'Team created', body: '', variant: 'success' });
      qc.invalidateQueries({ queryKey: ['admin-football-teams'] });
      setTeamModalOpen(false);
    },
  });
  const updateTeam = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof teamForm }) =>
      adminApi.put(`/football/teams/${id}`, data),
    onSuccess: () => {
      push({ title: 'Team updated', body: '', variant: 'success' });
      qc.invalidateQueries({ queryKey: ['admin-football-teams'] });
      setTeamModalOpen(false);
    },
  });
  const deleteTeam = useMutation({
    mutationFn: (id: string) => adminApi.delete(`/football/teams/${id}`),
    onSuccess: () => {
      push({ title: 'Team deleted', body: '', variant: 'info' });
      qc.invalidateQueries({ queryKey: ['admin-football-teams'] });
    },
  });

  const createPlayer = useMutation({
    mutationFn: (data: typeof playerForm) => adminApi.post('/football/players', data),
    onSuccess: () => {
      push({ title: 'Player created', body: '', variant: 'success' });
      qc.invalidateQueries({ queryKey: ['admin-football-players'] });
      setPlayerModalOpen(false);
    },
  });
  const updatePlayer = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof playerForm }) =>
      adminApi.put(`/football/players/${id}`, data),
    onSuccess: () => {
      push({ title: 'Player updated', body: '', variant: 'success' });
      qc.invalidateQueries({ queryKey: ['admin-football-players'] });
      setPlayerModalOpen(false);
    },
  });
  const deletePlayer = useMutation({
    mutationFn: (id: string) => adminApi.delete(`/football/players/${id}`),
    onSuccess: () => {
      push({ title: 'Player deleted', body: '', variant: 'info' });
      qc.invalidateQueries({ queryKey: ['admin-football-players'] });
    },
  });

  const createMatch = useMutation({
    mutationFn: (data: MatchPayload) => adminApi.post('/football/matches', data),
    onSuccess: () => {
      push({ title: 'Match created', body: '', variant: 'success' });
      qc.invalidateQueries({ queryKey: ['admin-football-matches'] });
      setMatchModalOpen(false);
    },
  });
  const updateMatch = useMutation({
    mutationFn: ({ id, data }: { id: string; data: MatchPayload }) =>
      adminApi.put(`/football/matches/${id}`, data),
    onSuccess: () => {
      push({ title: 'Match updated', body: '', variant: 'success' });
      qc.invalidateQueries({ queryKey: ['admin-football-matches'] });
      setMatchModalOpen(false);
    },
  });
  const deleteMatch = useMutation({
    mutationFn: (id: string) => adminApi.delete(`/football/matches/${id}`),
    onSuccess: () => {
      push({ title: 'Match deleted', body: '', variant: 'info' });
      qc.invalidateQueries({ queryKey: ['admin-football-matches'] });
    },
  });

  const createPredictionGame = useMutation({
    mutationFn: async (data: any) => {
      const idempotencyKey = crypto.randomUUID();
      return adminApi.post('/football/predictions/games', data, {
        headers: { 'Idempotency-Key': idempotencyKey },
      });
    },
    onSuccess: () => {
      push({ title: 'Prediction game created', body: '', variant: 'success' });
      qc.invalidateQueries({ queryKey: ['admin-football-matches'] });
      setPredictionModalOpen(false);
      setSelectedMatchForPrediction(null);
    },
    onError: (err: any) => {
      console.error('Prediction game creation failed:', err);
      push({ title: 'Failed', body: 'Could not create prediction game', variant: 'error' });
    },
  });

  const createTicketListing = useMutation({
    mutationFn: async (data: any) => {
      const idempotencyKey = crypto.randomUUID();
      return adminApi.post('/football/tickets/listings', data, {
        headers: { 'Idempotency-Key': idempotencyKey },
      });
    },
    onSuccess: () => {
      push({ title: 'Ticket listing created', body: '', variant: 'success' });
      qc.invalidateQueries({ queryKey: ['admin-football-matches'] });
      setTicketModalOpen(false);
      setSelectedMatchForTicket(null);
    },
    onError: (err: any) => {
      console.error('Ticket listing creation failed:', err);
      push({ title: 'Failed', body: 'Could not create ticket listing', variant: 'error' });
    },
  });

  // ----- Tournament advancement mutation -----
  const advanceTournament = useMutation({
    mutationFn: () => adminApi.post('/tournament/advance'),
    onSuccess: () => {
      push({ title: 'Tournament advanced', body: 'New matches generated.', variant: 'success' });
      qc.invalidateQueries({ queryKey: ['admin-football-matches'] });
    },
    onError: () => push({ title: 'Failed', body: 'Could not advance tournament.', variant: 'error' }),
  });

  // ----- Handlers -----
  const openTeamModal = (team: FootballTeam | null = null) => {
    if (team) {
      setEditingTeam(team);
      setTeamForm(team);
    } else {
      setEditingTeam(null);
      setTeamForm({ name: '', slug: '', group: '', flagUrl: '', coach: '', description: '' });
    }
    setTeamModalOpen(true);
  };

  const openPlayerModal = (player: FootballPlayer | null = null) => {
    if (player) {
      setEditingPlayer(player);
      setPlayerForm(player);
    } else {
      setEditingPlayer(null);
      setPlayerForm({ teamId: '', name: '', position: '', number: 0, goals: 0, assists: 0, imageUrl: '' });
    }
    setPlayerModalOpen(true);
  };

  const openMatchModal = (match: FootballMatch | null = null) => {
    if (match) {
      setEditingMatch(match);
      setMatchForm({
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        matchDate: match.matchDate.slice(0, 16),
        venue: match.venue || '',
        tournament: match.tournament,
        ticketUrl: match.ticketUrl || '',
        homeScore: match.homeScore !== undefined ? String(match.homeScore) : '',
        awayScore: match.awayScore !== undefined ? String(match.awayScore) : '',
        status: match.status || 'upcoming',
      });
    } else {
      setEditingMatch(null);
      setMatchForm({
        homeTeamId: '',
        awayTeamId: '',
        matchDate: '',
        venue: '',
        tournament: '',
        ticketUrl: '',
        homeScore: '',
        awayScore: '',
        status: 'upcoming',
      });
    }
    setMatchModalOpen(true);
  };

  const openPredictionModal = (match: FootballMatch) => {
    setSelectedMatchForPrediction(match);
    const matchDate = new Date(match.matchDate);
    const endsAt = new Date(matchDate.getTime() + 24 * 60 * 60 * 1000);
    setPredictionForm({
      name: `${match.homeTeam?.name || 'Home'} vs ${match.awayTeam?.name || 'Away'} - Prediction`,
      description: 'Predict the winner',
      predictionType: 'WINNER',
      points: 10,
      coinReward: 5,
      startsAt: new Date().toISOString().slice(0, 16),
      endsAt: endsAt.toISOString().slice(0, 16),
    });
    setPredictionModalOpen(true);
  };

  const openTicketModal = (match: FootballMatch) => {
    setSelectedMatchForTicket(match);
    const expireDate = new Date(new Date(match.matchDate).getTime() - 24 * 60 * 60 * 1000);
    setTicketForm({
      priceCoins: 100,
      seatInfo: '',
      expiresAt: expireDate.toISOString().slice(0, 16),
    });
    setTicketModalOpen(true);
  };

  const handleTeamSubmit = () => {
    if (editingTeam) updateTeam.mutate({ id: editingTeam.id, data: teamForm });
    else createTeam.mutate(teamForm);
  };

  const handlePlayerSubmit = () => {
    if (editingPlayer) updatePlayer.mutate({ id: editingPlayer.id, data: playerForm });
    else createPlayer.mutate(playerForm);
  };

  const handleMatchSubmit = () => {
    const payload: MatchPayload = {
      ...matchForm,
      matchDate: new Date(matchForm.matchDate).toISOString(),
      homeScore: matchForm.homeScore ? parseInt(matchForm.homeScore, 10) : null,
      awayScore: matchForm.awayScore ? parseInt(matchForm.awayScore, 10) : null,
    };
    if (editingMatch) {
      updateMatch.mutate({ id: editingMatch.id, data: payload });
    } else {
      createMatch.mutate(payload);
    }
  };

  const handlePredictionSubmit = () => {
    if (!selectedMatchForPrediction) return;
    createPredictionGame.mutate({
      ...predictionForm,
      matchId: selectedMatchForPrediction.id,
      startsAt: new Date(predictionForm.startsAt),
      endsAt: new Date(predictionForm.endsAt),
    });
  };

  const handleTicketSubmit = () => {
    if (!selectedMatchForTicket) return;
    const localDate = new Date(ticketForm.expiresAt);
    const utcExpiresAt = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000).toISOString();
    createTicketListing.mutate({
      matchId: selectedMatchForTicket.id,
      priceCoins: ticketForm.priceCoins,
      seatInfo: ticketForm.seatInfo,
      expiresAt: utcExpiresAt,
    });
  };

  if (teamsLoading || playersLoading || matchesLoading) return <Spinner />;

  return (
    <div className="admin-page space-y-8">
      <PageHeader title="World Cup Admin" subtitle="Manage teams, players, matches, predictions, and ticket resale" />
      <div className="flex gap-2 border-b border-sw-border mb-4">
        <button
          className={`px-4 py-2 text-sm font-semibold transition-all ${activeTab === 'teams' ? 'text-gold border-b-2 border-gold' : 'text-white/50 hover:text-white'}`}
          onClick={() => setActiveTab('teams')}
        >
          Teams
        </button>
        <button
          className={`px-4 py-2 text-sm font-semibold transition-all ${activeTab === 'players' ? 'text-gold border-b-2 border-gold' : 'text-white/50 hover:text-white'}`}
          onClick={() => setActiveTab('players')}
        >
          Players
        </button>
        <button
          className={`px-4 py-2 text-sm font-semibold transition-all ${activeTab === 'matches' ? 'text-gold border-b-2 border-gold' : 'text-white/50 hover:text-white'}`}
          onClick={() => setActiveTab('matches')}
        >
          Matches (with Prediction & Ticket)
        </button>
      </div>

      {activeTab === 'teams' && (
        <div className="card p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-heading font-bold text-white text-lg">Teams</h2>
            <Button variant="gold" onClick={() => openTeamModal()}>+ Add Team</Button>
          </div>
          {!teams?.length ? <EmptyState icon="🏆" message="No teams yet. Add one." /> : (
            <div className="overflow-x-auto">
              <table className="admin-table w-full">
                <thead>
                  <tr><th>Name</th><th>Slug</th><th>Group</th><th>Coach</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {teams.map(team => (
                    <tr key={team.id}>
                      <td className="font-medium flex items-center gap-2">
                        {team.flagUrl && <img src={team.flagUrl} alt={team.name} className="w-6 h-4 object-cover" />}
                        {team.name}
                      </td>
                      <td className="font-mono text-sm">{team.slug}</td>
                      <td>{team.group}</td>
                      <td>{team.coach}</td>
                      <td className="space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openTeamModal(team)}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => deleteTeam.mutate(team.id)}>Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'players' && (
        <div className="card p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-heading font-bold text-white text-lg">Players</h2>
            <Button variant="gold" onClick={() => openPlayerModal()}>+ Add Player</Button>
          </div>
          {!players?.length ? <EmptyState icon="⚽" message="No players yet. Add one." /> : (
            <div className="overflow-x-auto">
              <table className="admin-table w-full">
                <thead>
                  <tr><th>Name</th><th>Team</th><th>Position</th><th>Number</th><th>Goals</th><th>Assists</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {players.map(player => {
                    const team = teams?.find(t => t.id === player.teamId);
                    return (
                      <tr key={player.id}>
                        <td>{player.name}</td>
                        <td>{team?.name || '—'}</td>
                        <td>{player.position || '—'}</td>
                        <td>{player.number || '—'}</td>
                        <td>{player.goals}</td>
                        <td>{player.assists}</td>
                        <td className="space-x-2">
                          <Button variant="outline" size="sm" onClick={() => openPlayerModal(player)}>Edit</Button>
                          <Button variant="danger" size="sm" onClick={() => deletePlayer.mutate(player.id)}>Delete</Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'matches' && (
        <div className="card p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-heading font-bold text-white text-lg">Matches</h2>
            <div className="flex gap-2">
              <Button variant="gold" onClick={() => advanceTournament.mutate()} loading={advanceTournament.isPending}>
                Advance to Next Round
              </Button>
              <Button variant="gold" onClick={() => openMatchModal()}>+ Add Match</Button>
            </div>
          </div>
          {!matches?.length ? <EmptyState icon="🎫" message="No matches yet." /> : (
            <div className="overflow-x-auto">
              <table className="admin-table w-full">
                <thead>
                  <tr>
                    <th>Home</th><th>Away</th><th>Date</th><th>Venue</th><th>Ticket</th>
                    <th>Prediction Game</th><th>Resale Ticket</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map(match => (
                    <tr key={match.id}>
                      <td>{match.homeTeam?.name || match.homeTeamId}</td>
                      <td>{match.awayTeam?.name || match.awayTeamId}</td>
                      <td>{new Date(match.matchDate).toLocaleString()}</td>
                      <td>{match.venue}</td>
                      <td>{match.ticketUrl ? <a href={match.ticketUrl} target="_blank" rel="noopener noreferrer" className="text-gold">Link</a> : '—'}</td>
                      <td><Button variant="outline" size="sm" onClick={() => openPredictionModal(match)}>Add Prediction</Button></td>
                      <td><Button variant="outline" size="sm" onClick={() => openTicketModal(match)}>Sell Tickets</Button></td>
                      <td className="space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openMatchModal(match)}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => deleteMatch.mutate(match.id)}>Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Team Modal */}
      <Modal open={teamModalOpen} onClose={() => setTeamModalOpen(false)} title={editingTeam ? 'Edit Team' : 'Add Team'}>
        <form onSubmit={e => { e.preventDefault(); handleTeamSubmit(); }} className="space-y-4">
          <Input label="Name" value={teamForm.name} onChange={e => setTeamForm({ ...teamForm, name: e.target.value })} required />
          <Input label="Slug" value={teamForm.slug} onChange={e => setTeamForm({ ...teamForm, slug: e.target.value })} required />
          <Input label="Group" value={teamForm.group} onChange={e => setTeamForm({ ...teamForm, group: e.target.value })} />
          <Input label="Flag URL" value={teamForm.flagUrl} onChange={e => setTeamForm({ ...teamForm, flagUrl: e.target.value })} />
          <Input label="Coach" value={teamForm.coach} onChange={e => setTeamForm({ ...teamForm, coach: e.target.value })} />
          <textarea className="input-sw w-full" rows={3} placeholder="Description" value={teamForm.description} onChange={e => setTeamForm({ ...teamForm, description: e.target.value })} />
          <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setTeamModalOpen(false)}>Cancel</Button><Button variant="gold" type="submit">Save</Button></div>
        </form>
      </Modal>

      {/* Player Modal */}
      <Modal open={playerModalOpen} onClose={() => setPlayerModalOpen(false)} title={editingPlayer ? 'Edit Player' : 'Add Player'}>
        <form onSubmit={e => { e.preventDefault(); handlePlayerSubmit(); }} className="space-y-4">
          <select className="input-sw w-full" value={playerForm.teamId} onChange={e => setPlayerForm({ ...playerForm, teamId: e.target.value })} required>
            <option value="">Select Team</option>
            {teams?.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
          <Input label="Name" value={playerForm.name} onChange={e => setPlayerForm({ ...playerForm, name: e.target.value })} required />
          <Input label="Position" value={playerForm.position} onChange={e => setPlayerForm({ ...playerForm, position: e.target.value })} />
          <Input label="Number" type="number" value={playerForm.number} onChange={e => setPlayerForm({ ...playerForm, number: Number(e.target.value) })} />
          <Input label="Goals" type="number" value={playerForm.goals} onChange={e => setPlayerForm({ ...playerForm, goals: Number(e.target.value) })} />
          <Input label="Assists" type="number" value={playerForm.assists} onChange={e => setPlayerForm({ ...playerForm, assists: Number(e.target.value) })} />
          <Input label="Image URL" value={playerForm.imageUrl} onChange={e => setPlayerForm({ ...playerForm, imageUrl: e.target.value })} />
          <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setPlayerModalOpen(false)}>Cancel</Button><Button variant="gold" type="submit">Save</Button></div>
        </form>
      </Modal>

      {/* Match Modal */}
      <Modal open={matchModalOpen} onClose={() => setMatchModalOpen(false)} title={editingMatch ? 'Edit Match' : 'Add Match'}>
        <form onSubmit={e => { e.preventDefault(); handleMatchSubmit(); }} className="space-y-4">
          <select className="input-sw w-full" value={matchForm.homeTeamId} onChange={e => setMatchForm({ ...matchForm, homeTeamId: e.target.value })} required>
            <option value="">Home Team</option>
            {teams?.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
          <select className="input-sw w-full" value={matchForm.awayTeamId} onChange={e => setMatchForm({ ...matchForm, awayTeamId: e.target.value })} required>
            <option value="">Away Team</option>
            {teams?.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
          <Input label="Match Date" type="datetime-local" value={matchForm.matchDate} onChange={e => setMatchForm({ ...matchForm, matchDate: e.target.value })} required />
          <Input label="Venue" value={matchForm.venue} onChange={e => setMatchForm({ ...matchForm, venue: e.target.value })} />
          <Input label="Tournament" value={matchForm.tournament} onChange={e => setMatchForm({ ...matchForm, tournament: e.target.value })} />
          <Input label="Ticket URL" value={matchForm.ticketUrl} onChange={e => setMatchForm({ ...matchForm, ticketUrl: e.target.value })} />

          <label className="block text-white/70 text-sm">Status</label>
          <select className="input-sw w-full" value={matchForm.status} onChange={e => setMatchForm({ ...matchForm, status: e.target.value })}>
            <option value="upcoming">Upcoming</option>
            <option value="finished">Finished</option>
          </select>

          <Input
            label="Home Score"
            type="number"
            value={matchForm.homeScore}
            onChange={e => setMatchForm({ ...matchForm, homeScore: e.target.value })}
          />
          <Input
            label="Away Score"
            type="number"
            value={matchForm.awayScore}
            onChange={e => setMatchForm({ ...matchForm, awayScore: e.target.value })}
          />

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setMatchModalOpen(false)}>Cancel</Button>
            <Button variant="gold" type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      {/* Prediction Game Modal */}
      <Modal open={predictionModalOpen} onClose={() => setPredictionModalOpen(false)} title="Create Prediction Game">
        <form onSubmit={e => { e.preventDefault(); handlePredictionSubmit(); }} className="space-y-4">
          <Input label="Game Name" value={predictionForm.name} onChange={e => setPredictionForm({ ...predictionForm, name: e.target.value })} required />
          <Input label="Description" value={predictionForm.description} onChange={e => setPredictionForm({ ...predictionForm, description: e.target.value })} />
          <label className="block text-white/70 text-sm">Prediction Type</label>
          <select className="input-sw w-full" value={predictionForm.predictionType} onChange={e => setPredictionForm({ ...predictionForm, predictionType: e.target.value })}>
            <option value="WINNER">Winner</option>
            <option value="FIRST_SCORER">First Scorer</option>
            <option value="ASSIST">Assist</option>
            <option value="NEXT_STAGE">Next Stage</option>
          </select>
          <Input label="Points" type="number" value={predictionForm.points} onChange={e => setPredictionForm({ ...predictionForm, points: parseInt(e.target.value) })} required />
          <Input label="Coin Reward" type="number" value={predictionForm.coinReward} onChange={e => setPredictionForm({ ...predictionForm, coinReward: parseInt(e.target.value) })} required />
          <Input label="Start Date (UTC)" type="datetime-local" value={predictionForm.startsAt} onChange={e => setPredictionForm({ ...predictionForm, startsAt: e.target.value })} required />
          <Input label="End Date (UTC)" type="datetime-local" value={predictionForm.endsAt} onChange={e => setPredictionForm({ ...predictionForm, endsAt: e.target.value })} required />
          <Button type="submit" className="w-full" loading={createPredictionGame.isPending}>Create Game</Button>
        </form>
      </Modal>

      {/* Ticket Listing Modal */}
      <Modal open={ticketModalOpen} onClose={() => setTicketModalOpen(false)} title="Create Ticket Listing">
        <form onSubmit={e => { e.preventDefault(); handleTicketSubmit(); }} className="space-y-4">
          <Input label="Price (Coins)" type="number" value={ticketForm.priceCoins} onChange={e => setTicketForm({ ...ticketForm, priceCoins: parseInt(e.target.value) })} required />
          <Input label="Seat Info (optional)" value={ticketForm.seatInfo} onChange={e => setTicketForm({ ...ticketForm, seatInfo: e.target.value })} />
          <Input label="Expires At (UTC)" type="datetime-local" value={ticketForm.expiresAt} onChange={e => setTicketForm({ ...ticketForm, expiresAt: e.target.value })} required />
          <Button type="submit" className="w-full" loading={createTicketListing.isPending}>Create Listing</Button>
        </form>
      </Modal>
    </div>
  );
}