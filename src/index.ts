import axios from "axios"

class slushpool {

	// Slush Pool access token set using init() function
	private token: string | null = null

	/**
	 * Initialize the Slush Pool client library using your access token. You may optionally
	 * call this function multiple times to rotate between multiple access tokens / accounts.
	 */
	init(token: string) {
		this.token = token
	}

	/**
	 * Call Pool Stats API
	 */
	async stats() {
		const response = await this.request("https://slushpool.com/stats/json/btc") as PoolStatsAPIResponse
		const blocks: Block[] = []
		for (const blockHeight in response.btc.blocks) {
			const block = response.btc.blocks[blockHeight]
			blocks.push({
				number: parseInt(blockHeight),
				dateFound: new Date(block.date_found * 1000),
				miningDuration: block.mining_duration,
				totalShares: block.total_shares,
				state: block.state,
				confirmationsLeft: block.confirmations_left,
				value: parseFloat(block.value),
				userReward: parseFloat(block.user_reward),
				poolScoringHashRate: block.pool_scoring_hash_rate
			})
		}
		const poolStats: PoolStats = {
			luck: {
				10: parseFloat(response.btc.luck_b10),
				50: parseFloat(response.btc.luck_b50),
				250: parseFloat(response.btc.luck_b250)
			},
			hashRateUnit: response.btc.hash_rate_unit,
			scoringHashRate: response.btc.pool_scoring_hash_rate,
			activeWorkers: response.btc.pool_active_workers,
			round: {
				startTime: new Date(response.btc.round_started * 1000),
				duration: response.btc.round_duration,
				probability: parseFloat(response.btc.round_probability)
			},
			blocks: blocks
		}
		return poolStats
	}

	/**
	 * Call User Profile API
	 */
	async profile() {
		const response = await this.request("https://slushpool.com/accounts/profile/json/btc") as UserProfileAPIResponse
		const userProfile: UserProfile = {
			username: response.username,
			reward: {
				confirmed: parseFloat(response.btc.confirmed_reward),
				unconfirmed: parseFloat(response.btc.unconfirmed_reward),
				estimated: parseFloat(response.btc.estimated_reward),
				sendThreshold: parseFloat(response.btc.send_threshold),
			},
			hashRate: {
				unit: response.btc.hash_rate_unit,
				last5min: response.btc.hash_rate_5m,
				last60min: response.btc.hash_rate_60m,
				last24hr: response.btc.hash_rate_24h,
				scoring: response.btc.hash_rate_scoring,
				yesterday: response.btc.hash_rate_yesterday
			},
			workers: {
				ok: response.btc.ok_workers,
				low: response.btc.low_workers,
				off: response.btc.off_workers,
				dis: response.btc.dis_workers
			}
		}
		return userProfile
	}

	/**
	 * Call Daily Reward API
	 */
	async rewards() {
		const response = await this.request("https://slushpool.com/accounts/rewards/json/btc") as DailyRewardAPIResponse
		const rewards: DailyReward[] = []
		response.btc.daily_rewards.forEach(dailyReward => {
			rewards.push({
				date: new Date(dailyReward.date * 1000),
				totalReward: parseFloat(dailyReward.total_reward),
				miningReward: parseFloat(dailyReward.mining_reward),
				bosPlusReward: parseFloat(dailyReward.bos_plus_reward),
				referralBonus: parseFloat(dailyReward.referral_bonus),
				referralReward: parseFloat(dailyReward.referral_reward)
			})
		})
		return rewards
	}

	/**
	 * Call Worker API
	 */
	async workers() {
		const response = await this.request("https://slushpool.com/accounts/workers/json/btc") as WorkerAPIResponse
		const workers: SlushWorker[] = []
		for (const workerID in response.btc.workers) {
			const worker = response.btc.workers[workerID]
			workers.push({
				id: workerID,
				state: worker.state,
				lastShare: new Date(worker.last_share * 1000),
				hashRate: {
					unit: worker.hash_rate_unit,
					scoring: worker.hash_rate_scoring,
					last5m: worker.hash_rate_5m,
					last60m: worker.hash_rate_60m,
					last24hr: worker.hash_rate_24h
				}
			})
		}
		return workers
	}

	private async request(url: string) {
		if (this.token) {
			const response = await axios.get(url, {
				headers: {
					"X-SlushPool-Auth-Token": this.token
				}
			})
			return response.data
		}
		else {
			throw new Error("ERROR: Must initialize slushpool with authentication token before making a request.")
		}
	}

}

export default new slushpool()

/////////////////////////////////////////////////////////////////////////////////
// Node.js Wrapper Responses
/////////////////////////////////////////////////////////////////////////////////

/** Slush Pool stats */
interface PoolStats {
	/** Pool luck */
	luck: {
		/** Pool luck for the last ten blocks */
		10: number
		/** Pool luck for the last 50 blocks */
		50: number
		/** Pool luck for the last 250 blocks */
		250: number
	}
	/** Unit used for the hash rate values */
	hashRateUnit: string
	/** Pool scoring hash rate */
	scoringHashRate: number
	/** Number of pool active workers */
	activeWorkers: number
	/** Information about the current round */
	round: {
		/** Time when the current round was started */
		startTime: Date
		/** Duration of the current round (seconds) */
		duration: number
		/** Current CDF for the current round */
		probability: number
	}
	/** The last 15 blocks */
	blocks: Block[]
}

/** Information about a given block */
interface Block {
	/** Block height number */
	number: number,
	/** Time when the block was found */
	dateFound: Date,
	/** Duration of the round leading to block (seconds) */
	miningDuration: number,
	/** Number of shares collected during the round */
	totalShares: number,
	/** Block state */
	state: string,
	/** Number of confirmations left */
	confirmationsLeft: number,
	/** Block value */
	value: number,
	/** User reward for the block */
	userReward: number,
	/** Pool scoring hash rate at the time when block was found */
	poolScoringHashRate: number
}

/** Slush Pool User Profile */
interface UserProfile {
	username: string
	reward: {
		confirmed: number
		unconfirmed: number
		/** Estimated reward for the current block */
		estimated: number
		sendThreshold: number
	}
	hashRate: {
		unit: string
		last5min: number
		last60min: number
		last24hr: number
		scoring: number
		yesterday: number
	}
	workers: {
		ok: number
		low: number
		off: number
		dis: number
	}
}

/** Slush Pool Daily Reward */
interface DailyReward {
	date: Date,
	totalReward: number
	miningReward: number
	bosPlusReward: number
	referralBonus: number
	referralReward: number
}

interface SlushWorker {
	/** Miner login ID (e.g. username.worker1) */
	id: string,
	/** State of the worker */
	state: "ok" | "low" | "off" | "dis",
	/** Time of the last accepted share */
	lastShare: Date,
	/** Miner hash rate information */
	hashRate: {
		/** Unit used for the hash rate values */
		unit: string,
		/** Current scoring hash rate */
		scoring: number,
		/** Average hash rate for the last 5 minutes */
		last5m: number,
		/** Average hash rate for the last 60 minutes */
		last60m: number,
		/** Average hash rate for the last 24 hours */
		last24hr: number
	}
}

/////////////////////////////////////////////////////////////////////////////////
// Slush Pool API Responses
/////////////////////////////////////////////////////////////////////////////////

/** Slush Pool's Pool Stats API response */
interface PoolStatsAPIResponse {
	/** Bitcoin pool stats */
	btc: {
		/** Pool luck for the last ten blocks */
		luck_b10: string
		/** Pool luck for the last 50 blocks */
		luck_b50: string
		/** Pool luck for the last 250 blocks */
		luck_b250: string
		/** Unit used for the hash rate values */
		hash_rate_unit: string
		/** Pool scoring hash rate */
		pool_scoring_hash_rate: number
		/** Number of pool active workers */
		pool_active_workers: number
		/** Current CDF for the current round */
		round_probability: string
		/** Unix time when the current round was started */
		round_started: number
		/** Duration of the current round (seconds) */
		round_duration: number
		/** Information about the last 15 blocks, keyed by block height number */
		blocks: {
			[key: number]: {
				/** Unix time when given block was found */
				date_found: number
				/** Duration of the round leading to given block (seconds) */
				mining_duration: number
				/** Number of shares collected during the round */
				total_shares: number
				/** State of given block */
				state: string
				/** Number of confirmations left */
				confirmations_left: number
				/** Block value */
				value: string
				/** User reward for the given block */
				user_reward: string
				/** Pool scoring hash rate at the time when block was found */
				pool_scoring_hash_rate: number
			},
		}
	}
}

/** Slush Pool's User Profile API response */
interface UserProfileAPIResponse {
	username: string
	btc: {
		confirmed_reward: string
		unconfirmed_reward: string
		estimated_reward: string
		send_threshold: string
		hash_rate_unit: string
		hash_rate_5m: number
		hash_rate_60m: number
		hash_rate_24h: number
		hash_rate_scoring: number
		hash_rate_yesterday: number
		low_workers: number
		off_workers: number
		ok_workers: number
		dis_workers: number
	}
}

/** Slush Pool's Daily Reward API response */
interface DailyRewardAPIResponse {
	btc: {
		daily_rewards: DailyRewardAPI[]
	}
}

/** Reward stats for a given day */
interface DailyRewardAPI {
	date: number,
	total_reward: string,
	mining_reward: string,
	bos_plus_reward: string,
	referral_bonus: string,
	referral_reward: string
}

/** Slush Pool's Worker API response */
interface WorkerAPIResponse {
	btc: {
		workers: {
			[key: string]: {
				state: "ok" | "low" | "off" | "dis",
				last_share: number,
				hash_rate_unit: string,
				hash_rate_scoring: number,
				hash_rate_5m: number,
				hash_rate_60m: number,
				hash_rate_24h: number,
			}
		}
	}
}
