'use client'

import type { Game } from "~/types/game";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import StatsComponent from "~/app/_components/StatsComponent";

export default function StatsClient({ game }: { game: Game }) {
    
    const router = useRouter();
 
    const { data: gameWordsData } = api.game.getGameWords.useQuery({ gameId: game.id });

    const gameWords = gameWordsData?.map(wordData => ({
        word: wordData.word,
        outcome: wordData.outcome
    })) ?? [];

    const stats = {
        score: game.score,
        totalTime: game.timeLimit,
        totalPasses: game.pass,
        usedPasses: game.passUsed,
        mistakes: game.mistakes,
        wordsData: gameWords
    };

    const onRestart = () => {
        router.push('game/single');
    };

    const onHome = () => {
        router.push('/');
    };

    return (
        <div>
            <StatsComponent 
                stats={stats} 
                onRestart={onRestart} 
                onHome={onHome} 
            />
        </div>
    );
}