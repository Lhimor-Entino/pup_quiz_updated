<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class QuizEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $state;
    public $current_question;
    public $item_number;
    public $lobby_id;
    public $current_level;
    /**
     * Create a new event instance.
     */
    public function __construct($state,  $current_question, $item_number, $lobby_id, $current_level)
    {
        $this->state = $state;
        $this->current_question = $current_question;
        $this->item_number = $item_number;
        $this->lobby_id = $lobby_id;
        $this->current_level = $current_level;
    }
    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): Channel
    {
        return new Channel('quiz-room_' . strval($this->lobby_id));
    }
}
