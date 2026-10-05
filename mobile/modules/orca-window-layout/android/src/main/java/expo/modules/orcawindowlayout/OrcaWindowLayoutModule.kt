package expo.modules.orcawindowlayout

import android.os.Bundle
import androidx.window.layout.FoldingFeature
import androidx.window.layout.WindowInfoTracker
import androidx.window.layout.WindowMetricsCalculator
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

private const val WINDOW_LAYOUT_EVENT = "onWindowLayout"

class OrcaWindowLayoutModule : Module() {
  private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
  private var observationJob: Job? = null
  @Volatile
  private var latestLayout: Bundle? = null

  override fun definition() = ModuleDefinition {
    Name("OrcaWindowLayout")
    Events(WINDOW_LAYOUT_EVENT)

    OnStartObserving(WINDOW_LAYOUT_EVENT) {
      startObserving()
    }

    OnStopObserving(WINDOW_LAYOUT_EVENT) {
      stopObserving()
    }

    OnDestroy {
      stopObserving()
      scope.cancel()
    }

    Function("getCurrentLayout") {
      currentLayout()
    }
  }

  private fun startObserving() {
    val activity = appContext.throwingActivity
    observationJob?.cancel()
    observationJob = scope.launch {
      WindowInfoTracker.getOrCreate(activity)
        .windowLayoutInfo(activity)
        .collectLatest { layoutInfo ->
          val payload = layoutPayload(activity, layoutInfo.displayFeatures)
          latestLayout = payload
          sendEvent(WINDOW_LAYOUT_EVENT, payload)
        }
    }
  }

  private fun stopObserving() {
    observationJob?.cancel()
    observationJob = null
  }

  private fun currentLayout(): Bundle {
    latestLayout?.let { return Bundle(it) }
    val activity = appContext.throwingActivity
    // The synchronous function is a best-effort snapshot. The event stream is authoritative because
    // WindowLayoutInfo is delivered asynchronously by WindowManager.
    return layoutPayload(
      activity,
      emptyList()
    ).apply {
      putBoolean("snapshotAvailable", false)
    }
  }

  private fun layoutPayload(
    activity: android.app.Activity,
    displayFeatures: List<androidx.window.layout.DisplayFeature>
  ): Bundle {
    // React Native reports layout dimensions in dp; WindowManager reports bounds in px.
    val density = activity.resources.displayMetrics.density
    val bounds = WindowMetricsCalculator.getOrCreate()
      .computeCurrentWindowMetrics(activity)
      .bounds
    val foldingFeature = displayFeatures.filterIsInstance<FoldingFeature>().firstOrNull()
    val payload = Bundle()
    payload.putDouble("width", bounds.width().toDp(density))
    payload.putDouble("height", bounds.height().toDp(density))
    payload.putBoolean("snapshotAvailable", true)
    if (foldingFeature == null) {
      payload.putBoolean("isSeparating", false)
      return payload
    }

    payload.putBundle(
      "foldingFeatureBounds",
      Bundle().apply {
        putDouble("left", foldingFeature.bounds.left.toDp(density))
        putDouble("top", foldingFeature.bounds.top.toDp(density))
        putDouble("width", foldingFeature.bounds.width().toDp(density))
        putDouble("height", foldingFeature.bounds.height().toDp(density))
      }
    )
    payload.putString("foldingFeatureState", foldingFeature.state.toWireName())
    payload.putString("foldingFeatureOcclusionType", foldingFeature.occlusionType.toWireName())
    payload.putBoolean("isSeparating", foldingFeature.isSeparating)
    return payload
  }
}

private fun Int.toDp(density: Float): Double = this.toDouble() / density

private fun FoldingFeature.State.toWireName(): String = when (this) {
  FoldingFeature.State.FLAT -> "flat"
  FoldingFeature.State.HALF_OPENED -> "half-opened"
  else -> "unknown"
}

private fun FoldingFeature.OcclusionType.toWireName(): String = when (this) {
  FoldingFeature.OcclusionType.NONE -> "none"
  FoldingFeature.OcclusionType.FULL -> "full"
  else -> "unknown"
}
